/**
 * Utility functions for Pub/Public event live metrics computation
 * Implements crowd normalization, freshness weights, timeline computation, and line estimation
 */

/**
 * 4.1 Crowd normalization
 * Converts crowd enum to normalized value (0-120) based on capacity profile
 */
export function normalizeCrowd(crowdLevel, capacityProfile) {
    if (!capacityProfile || !crowdLevel) return null;
    
    const { deadMax, chillMax, packedMax, peakMax } = capacityProfile;
    
    // Determine headcount range
    let headcountEstimate;
    switch (crowdLevel) {
        case 'DEAD':
            headcountEstimate = deadMax / 2; // midpoint of [0, deadMax]
            break;
        case 'CHILL':
            headcountEstimate = (deadMax + chillMax) / 2; // midpoint
            break;
        case 'PACKED':
            headcountEstimate = (chillMax + packedMax) / 2;
            break;
        case 'TOO_PACKED':
            headcountEstimate = (packedMax + peakMax) / 2;
            break;
        default:
            return null;
    }
    
    // Normalize and clamp to [0, 120]
    const normalized = Math.min(120, Math.max(0, 100 * headcountEstimate / peakMax));
    return normalized;
}

/**
 * 4.2 Freshness weights
 * Calculate weight based on how old the data point is
 */
export function calculateTimelineWeight(minutesAgo) {
    return Math.exp(-minutesAgo / 12);
}

export function calculateLineWeight(minutesAgo, isInside = false) {
    let weight = Math.exp(-minutesAgo / 10);
    if (isInside) {
        weight *= 0.6; // reduce weight for inside reports
    }
    return weight;
}

/**
 * Weighted average helper
 */
function weightedAverage(values, weights) {
    if (values.length === 0) return 0;
    
    let sumWeighted = 0;
    let sumWeights = 0;
    
    for (let i = 0; i < values.length; i++) {
        sumWeighted += values[i] * weights[i];
        sumWeights += weights[i];
    }
    
    return sumWeights > 0 ? sumWeighted / sumWeights : 0;
}

/**
 * Get crowd level description
 */
function getCrowdDescription(normalizedCrowd) {
    if (normalizedCrowd >= 80) return 'TOO_PACKED';
    if (normalizedCrowd >= 55) return 'PACKED';
    if (normalizedCrowd >= 25) return 'CHILL';
    return 'DEAD';
}

/**
 * Determine movement based on line and crowd
 */
function determineMovement(lineData, crowdNow, trend, feedbackCount) {
    // If very little data, default to STAYING
    if (feedbackCount < 3) {
        return 'STAYING';
    }

    const now = new Date();
    const tenMinAgo = new Date(now.getTime() - 10 * 60 * 1000);
    
    // Get recent line reports (last 10 min)
    const recentLines = lineData.filter(f => 
        new Date(f.timestamp) >= tenMinAgo && 
        f.lineMinutes !== undefined && 
        f.lineMinutes !== null
    );
    
    const hasLine = recentLines.length > 0 && recentLines.some(f => f.lineMinutes > 5);
    const avgLine = recentLines.length > 0 
        ? recentLines.reduce((sum, f) => sum + f.lineMinutes, 0) / recentLines.length 
        : 0;
    
    const isCrowded = crowdNow >= 50;
    const hasSignificantLine = avgLine > 10;
    
    // ARRIVING: Line exists AND (crowd rising OR already crowded)
    if (hasSignificantLine && (trend > 3 || isCrowded)) {
        return 'ARRIVING';
    }
    
    // LEAVING: No line AND low crowd AND declining trend
    if (!hasLine && crowdNow < 40 && trend < -5) {
        return 'LEAVING';
    }
    
    // STAYING: Short/no line but crowded (stable), OR trend is stable
    if ((isCrowded && avgLine <= 10) || (Math.abs(trend) <= 5)) {
        return 'STAYING';
    }
    
    // Default based on trend
    if (trend > 3) return 'ARRIVING';
    if (trend < -5) return 'LEAVING';
    return 'STAYING';
}

/**
 * 4.3 Timeline computation
 * Computes current vibe, crowd, and determines event stage
 */
export function computeTimeline(feedbackData, capacityProfile, eventEndTime) {
    const now = new Date();
    const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
    const fifteenMinAgo = new Date(now.getTime() - 15 * 60 * 1000);
    
    console.log('[Timeline] Starting computation with:', {
        feedbackCount: feedbackData.length,
        hasCapacityProfile: !!capacityProfile,
        capacityProfile: capacityProfile
    });
    
    // Filter feedback from last 30 minutes
    const recent30m = feedbackData.filter(f => new Date(f.timestamp) >= thirtyMinAgo);
    
    console.log('[Timeline] Recent 30m feedback:', recent30m.length);
    
    if (recent30m.length === 0) {
        return {
            stage: 'WARM',
            position: 0,
            vibeNow: null,
            crowdNow: 'No reports yet',
            crowdNumeric: 0,
            compositeNow: 0,
            movement: 'No reports yet',
            feedbackCount: 0
        };
    }
    
    // Compute weighted averages for last 30 min
    const vibes = [];
    const vibeWeights = [];
    const crowds = [];
    const crowdWeights = [];
    
    recent30m.forEach(feedback => {
        const minutesAgo = (now - new Date(feedback.timestamp)) / (60 * 1000);
        const weight = calculateTimelineWeight(minutesAgo);
        
        if (feedback.vibe !== undefined && feedback.vibe !== null) {
            vibes.push(feedback.vibe);
            vibeWeights.push(weight);
        }
        
        if (feedback.crowd) {
            if (capacityProfile) {
                const normalized = normalizeCrowd(feedback.crowd, capacityProfile);
                console.log('[Timeline] Normalizing crowd:', feedback.crowd, '→', normalized);
                if (normalized !== null) {
                    crowds.push(normalized);
                    crowdWeights.push(weight);
                }
            } else {
                // Fallback: use simple crowd mapping when no capacity profile
                let fallbackValue;
                switch (feedback.crowd) {
                    case 'DEAD': fallbackValue = 10; break;
                    case 'CHILL': fallbackValue = 40; break;
                    case 'PACKED': fallbackValue = 75; break;
                    case 'TOO_PACKED': fallbackValue = 95; break;
                    default: fallbackValue = null;
                }
                console.log('[Timeline] Using fallback crowd mapping:', feedback.crowd, '→', fallbackValue);
                if (fallbackValue !== null) {
                    crowds.push(fallbackValue);
                    crowdWeights.push(weight);
                }
            }
        }
    });
    
    const vibeNow = vibes.length > 0 ? weightedAverage(vibes, vibeWeights) : 0;
    const crowdNumeric = crowds.length > 0 ? weightedAverage(crowds, crowdWeights) : 0;
    const compositeNow = 0.6 * vibeNow + 0.4 * crowdNumeric;
    
    console.log('[Timeline] Computed values:', {
        vibes: vibes.length,
        crowds: crowds.length,
        vibeNow,
        crowdNumeric,
        compositeNow
    });
    
    // Compute trend (0-15 min vs 15-30 min)
    const recent15m = feedbackData.filter(f => {
        const t = new Date(f.timestamp);
        return t >= fifteenMinAgo && t < now;
    });
    
    const prev15m = feedbackData.filter(f => {
        const t = new Date(f.timestamp);
        return t >= thirtyMinAgo && t < fifteenMinAgo;
    });
    
    console.log('[Timeline] Trend windows:', {
        recent15mCount: recent15m.length,
        prev15mCount: prev15m.length,
        recent15mTimestamps: recent15m.map(f => new Date(f.timestamp).toLocaleTimeString()),
        prev15mTimestamps: prev15m.map(f => new Date(f.timestamp).toLocaleTimeString())
    });
    
    const computeComposite = (data) => {
        const v = [], vw = [];
        const c = [], cw = [];
        data.forEach(f => {
            const minutesAgo = (now - new Date(f.timestamp)) / (60 * 1000);
            const weight = calculateTimelineWeight(minutesAgo);
            if (f.vibe) { 
                v.push(f.vibe); 
                vw.push(weight); 
            }
            if (f.crowd) {
                if (capacityProfile) {
                    const norm = normalizeCrowd(f.crowd, capacityProfile);
                    if (norm !== null) { 
                        c.push(norm); 
                        cw.push(weight); 
                    }
                } else {
                    // Fallback mapping
                    let fallbackValue;
                    switch (f.crowd) {
                        case 'DEAD': fallbackValue = 10; break;
                        case 'CHILL': fallbackValue = 40; break;
                        case 'PACKED': fallbackValue = 75; break;
                        case 'TOO_PACKED': fallbackValue = 95; break;
                        default: fallbackValue = null;
                    }
                    if (fallbackValue !== null) { 
                        c.push(fallbackValue); 
                        cw.push(weight); 
                    }
                }
            }
        });
        const vibeAvg = v.length > 0 ? weightedAverage(v, vw) : 0;
        const crowdAvg = c.length > 0 ? weightedAverage(c, cw) : 0;
        return 0.6 * vibeAvg + 0.4 * crowdAvg;
    };
    
    const compositeRecent = recent15m.length > 0 ? computeComposite(recent15m) : compositeNow;
    const compositePrev = prev15m.length > 0 ? computeComposite(prev15m) : compositeNow;
    
    // Fix trend calculation: if one window is empty, use compositeNow as baseline
    // This prevents false "dying" signals when all feedback is in one time window
    let trend;
    if (recent15m.length > 0 && prev15m.length > 0) {
        // Both windows have data - normal trend calculation
        trend = compositeRecent - compositePrev;
    } else if (recent15m.length > 0 && prev15m.length === 0) {
        // Only recent data - assume positive trend (party building up)
        trend = compositeRecent - (compositeNow * 0.5); // conservative positive trend
    } else if (recent15m.length === 0 && prev15m.length > 0) {
        // Only old data - assume stable, not dying yet (people might just pause reporting)
        trend = 0; // neutral trend - don't penalize for lack of very recent feedback
    } else {
        trend = 0;
    }
    
    console.log('[Timeline] Trend calculation:', {
        compositeRecent,
        compositePrev,
        trend,
        recent15mCount: recent15m.length,
        prev15mCount: prev15m.length,
        trendLogic: recent15m.length > 0 && prev15m.length > 0 ? 'both windows' : 
                    recent15m.length > 0 ? 'recent only' : 
                    prev15m.length > 0 ? 'old only (stable)' : 'no data'
    });
    
    // Determine movement (ARRIVING/STAYING/LEAVING)
    const movement = determineMovement(feedbackData, crowdNumeric, trend, recent30m.length);
    
    console.log('[Timeline] Movement determination:', {
        movement,
        crowdNumeric,
        trend,
        feedbackCount: recent30m.length
    });
    
    // Determine stage - focus on current composite score, not just trend
    const thirtyMinAfterEnd = new Date(eventEndTime.getTime() + 30 * 60 * 1000);
    let stage;
    let position;
    
    // Adapt thresholds based on feedback count
    const minFeedbackForPeak = recent30m.length >= 5 ? 2 : 1;
    
    if (now > thirtyMinAfterEnd || recent30m.length < minFeedbackForPeak) {
        stage = 'ENDED';
        position = 100;
    } else if (compositeNow >= 65 && trend >= -10) {
        // PEAK: High composite score, allow slightly negative trend (-10 instead of -5)
        // People might pause reporting briefly but party is still good
        stage = 'PEAK';
        position = Math.min(85, Math.max(60, 60 + (compositeNow - 65) * 0.8));
    } else if (compositeNow >= 50 && compositeNow < 65) {
        // WARM: Decent energy, building up or maintaining
        stage = 'WARM';
        position = Math.min(55, 25 + (compositeNow - 50) * 2);
    } else if (compositeNow < 35 || (compositeNow < 50 && trend < -15 && movement === 'LEAVING')) {
        // DYING: Low composite OR (low-ish composite AND significant decline AND people leaving)
        // Only declare dying if composite is actually bad, not just old data
        stage = 'DYING';
        position = 90;
    } else {
        // Default WARM for anything in between
        stage = 'WARM';
        position = 25;
    }
    
    // Remove the "low feedback downgrade to WARM" - trust the composite score
    // if (recent30m.length < 3 && stage === 'PEAK') {
    //     stage = 'WARM';
    //     position = 40;
    // }
    
    console.log('[Timeline] Final stage determination:', {
        stage,
        position,
        compositeNow,
        trend,
        feedbackCount: recent30m.length,
        passedPeakThreshold: compositeNow >= 65,
        passedTrendThreshold: trend >= -5
    });
    
    return {
        stage,
        position,
        vibeNow: Math.round(vibeNow),
        crowdNow: getCrowdDescription(crowdNumeric),
        crowdNumeric: Math.round(crowdNumeric),
        compositeNow: Math.round(compositeNow),
        movement,
        feedbackCount: recent30m.length
    };
}

/**
 * 4.4 Line estimate computation
 * Trimmed weighted median for line wait times
 */
export function computeLineEstimate(feedbackData, eventType) {
    const now = new Date();
    const twentyMinAgo = new Date(now.getTime() - 20 * 60 * 1000);
    
    // Filter line feedback from last 20 minutes
    const lineData = feedbackData
        .filter(f => {
            return new Date(f.timestamp) >= twentyMinAgo && 
                   f.lineMinutes !== undefined && 
                   f.lineMinutes !== null;
        })
        .map(f => ({
            minutes: f.lineMinutes,
            weight: calculateLineWeight((now - new Date(f.timestamp)) / (60 * 1000), f.isInside),
            timestamp: f.timestamp
        }));
    
    if (lineData.length === 0) {
        return {
            estimate: null,
            label: 'UNKNOWN',
            count: 0
        };
    }
    
    // Sort by line minutes
    lineData.sort((a, b) => a.minutes - b.minutes);
    
    // Calculate total weight
    const totalWeight = lineData.reduce((sum, d) => sum + d.weight, 0);
    
    // Trim top and bottom 10% of total weight
    const trimAmount = totalWeight * 0.1;
    let bottomTrimmed = 0;
    let topTrimmed = 0;
    
    // Trim bottom
    let startIdx = 0;
    while (startIdx < lineData.length && bottomTrimmed < trimAmount) {
        bottomTrimmed += lineData[startIdx].weight;
        startIdx++;
    }
    
    // Trim top
    let endIdx = lineData.length - 1;
    while (endIdx >= 0 && topTrimmed < trimAmount) {
        topTrimmed += lineData[endIdx].weight;
        endIdx--;
    }
    
    // Get trimmed data
    const trimmedData = lineData.slice(Math.max(0, startIdx - 1), Math.min(lineData.length, endIdx + 2));
    
    if (trimmedData.length === 0) {
        return {
            estimate: lineData[0].minutes,
            label: getLineLabel(lineData[0].minutes, eventType),
            count: lineData.length
        };
    }
    
    // Weighted median of trimmed data
    const trimmedWeight = trimmedData.reduce((sum, d) => sum + d.weight, 0);
    const halfWeight = trimmedWeight / 2;
    
    let cumulativeWeight = 0;
    let estimate = trimmedData[0].minutes;
    
    for (const data of trimmedData) {
        cumulativeWeight += data.weight;
        if (cumulativeWeight >= halfWeight) {
            estimate = data.minutes;
            break;
        }
    }
    
    return {
        estimate: Math.round(estimate),
        label: getLineLabel(estimate, eventType),
        count: lineData.length
    };
}

/**
 * Get line label based on event type
 */
function getLineLabel(minutes, eventType) {
    if (eventType === 'pub') {
        if (minutes <= 5) return 'No line';
        if (minutes <= 10) return 'Short';
        if (minutes <= 20) return 'Normal';
        if (minutes <= 35) return 'Long';
        return 'Cooked';
    } else { // public
        if (minutes <= 5) return 'Walk-in';
        if (minutes <= 15) return 'Short';
        if (minutes <= 30) return 'Normal';
        if (minutes <= 50) return 'Long';
        return 'Cooked';
    }
}
