import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Event'
export const size = {
    width: 1200,
    height: 630,
}
export const contentType = 'image/png'

async function getEventData(id) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        const response = await fetch(`${baseUrl}/api/blog?id=${id}`, {
            cache: 'no-store'
        })
        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error fetching event:', error)
        return null
    }
}

export default async function Image({ params }) {
    const resolvedParams = await params
    const event = await getEventData(resolvedParams.id)

    if (!event) {
        return new ImageResponse(
            (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontSize: 60,
                        fontWeight: 'bold',
                    }}
                >
                    Event Not Found
                </div>
            ),
            {
                ...size,
            }
        )
    }

    const eventDate = new Date(event.startDateTime).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    const eventTime = new Date(event.startDateTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    })

    // Determine category badge
    let categoryBadge = ''
    let categoryColor = '#9333ea' // purple
    if (event.eventCategory === 'residential_college') {
        categoryBadge = event.organizer || event.residentialCollege || 'Residential College'
        categoryColor = '#ec4899' // pink
    } else if (event.eventCategory === 'university') {
        categoryBadge = 'Rice University'
        categoryColor = '#3b82f6' // blue
    }

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
                    position: 'relative',
                }}
            >
                {/* Decorative Background Pattern */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0.1,
                        background: 'radial-gradient(circle at 20% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)',
                    }}
                />

                <div
                    style={{
                        display: 'flex',
                        width: '100%',
                        height: '100%',
                        padding: '60px',
                        position: 'relative',
                    }}
                >
                    {/* Left Content Section */}
                    <div
                        style={{
                            flex: event.images && event.images.length > 0 ? 1.2 : 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            paddingRight: event.images && event.images.length > 0 ? '40px' : '0',
                        }}
                    >
                        {/* Top Section */}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {/* Category Badge */}
                            {categoryBadge && (
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginBottom: '20px',
                                    }}
                                >
                                    <div
                                        style={{
                                            background: categoryColor,
                                            color: 'white',
                                            padding: '8px 20px',
                                            borderRadius: '20px',
                                            fontSize: '22px',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                                        }}
                                    >
                                        ✨ {categoryBadge}
                                    </div>
                                </div>
                            )}

                            {/* Event Title */}
                            <div
                                style={{
                                    fontSize: event.title.length > 40 ? '50px' : '60px',
                                    fontWeight: 'bold',
                                    color: 'white',
                                    lineHeight: 1.2,
                                    marginBottom: '20px',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                }}
                            >
                                {event.title}
                            </div>

                            {/* Event Description */}
                            {event.description && (
                                <div
                                    style={{
                                        fontSize: '24px',
                                        color: 'rgba(255,255,255,0.8)',
                                        lineHeight: 1.4,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        marginBottom: '30px',
                                    }}
                                >
                                    {event.description.split('\n')[0]}
                                </div>
                            )}
                        </div>

                        {/* Bottom Section - Event Details */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {/* Date & Time */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div
                                    style={{
                                        fontSize: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    📅
                                </div>
                                <div
                                    style={{
                                        fontSize: '24px',
                                        color: 'white',
                                        fontWeight: '500',
                                    }}
                                >
                                    {eventDate} • {eventTime}
                                </div>
                            </div>

                            {/* Location */}
                            {event.location && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div
                                        style={{
                                            fontSize: '24px',
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        📍
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '24px',
                                            color: 'white',
                                            fontWeight: '500',
                                        }}
                                    >
                                        {event.location}
                                    </div>
                                </div>
                            )}

                            {/* Host */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div
                                    style={{
                                        fontSize: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    👤
                                </div>
                                <div
                                    style={{
                                        fontSize: '24px',
                                        color: 'rgba(255,255,255,0.9)',
                                        fontWeight: '500',
                                    }}
                                >
                                    Hosted by {event.host}
                                </div>
                            </div>

                            {/* Rating */}
                            {event.averageRating > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div
                                        style={{
                                            fontSize: '24px',
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        ⭐
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '24px',
                                            color: '#fbbf24',
                                            fontWeight: '600',
                                        }}
                                    >
                                        {event.averageRating.toFixed(1)} ({event.totalRatings} {event.totalRatings === 1 ? 'review' : 'reviews'})
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Image Section */}
                    {event.images && event.images.length > 0 && (
                        <div
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <img
                                src={event.images[0]}
                                alt={event.title}
                                style={{
                                    width: '100%',
                                    height: '510px',
                                    objectFit: 'cover',
                                    borderRadius: '20px',
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Bottom Branding */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '20px',
                        right: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                    }}
                >
                    <div
                        style={{
                            fontSize: '20px',
                            color: 'rgba(255,255,255,0.6)',
                            fontWeight: '500',
                        }}
                    >
                        riceparties.com
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
