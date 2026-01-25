import { headers } from 'next/headers'

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

export async function generateMetadata({ params }) {
    const resolvedParams = await params
    const event = await getEventData(resolvedParams.id)

    if (!event) {
        return {
            title: 'Event Not Found - Rice Parties',
            description: 'The event you are looking for could not be found.',
        }
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

    const description = event.description 
        ? `${event.description.substring(0, 155)}...`
        : `Join us at ${event.location} on ${eventDate} at ${eventTime}`

    const title = `${event.title} - Rice Parties`

    // Determine category for keywords
    let categoryKeywords = []
    if (event.eventCategory === 'residential_college') {
        categoryKeywords = ['residential college', event.organizer || event.residentialCollege || '']
    } else if (event.eventCategory === 'university') {
        categoryKeywords = ['Rice University', 'university event']
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const eventUrl = `${baseUrl}/blogs/${resolvedParams.id}`

    return {
        title,
        description,
        keywords: [
            event.title,
            event.eventType || 'event',
            event.host,
            ...categoryKeywords,
            'Rice University',
            'student events',
            event.location,
        ].filter(Boolean),
        authors: [{ name: event.host }],
        openGraph: {
            title: event.title,
            description,
            url: eventUrl,
            siteName: 'Rice Parties',
            images: [
                {
                    url: `${baseUrl}/blogs/${resolvedParams.id}/opengraph-image`,
                    width: 1200,
                    height: 630,
                    alt: event.title,
                },
            ],
            locale: 'en_US',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: event.title,
            description,
            images: [`${baseUrl}/blogs/${resolvedParams.id}/opengraph-image`],
            creator: '@riceparties',
        },
        other: {
            'event:start_time': event.startDateTime,
            'event:end_time': event.endDateTime,
            'event:location': event.location,
        },
    }
}

export default function Layout({ children }) {
    return children
}
