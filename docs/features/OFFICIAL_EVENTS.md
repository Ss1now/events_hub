# Public Events Feature

## Overview

The Public Events category is designed for university-sanctioned and residential college-hosted events. This includes:
- **Residential College Publics** - Scheduled parties hosted by residential colleges
- **Pub Theme Nights** - Weekly recurring events at the campus pub with varying themes
- **University-Wide Events** - Public campus events

## Key Features

### 1. Public Events Tab
Users can filter events by clicking the "Public" tab on the homepage alongside:
- **Public** - Shows all residential college and university events
- **Upcoming** - Future student-created events
- **Happening Now** - Live student-created events  
- **Past** - Past student-created events

### 2. Event Categories

#### Residential College Events
- Set with `eventCategory: 'residential_college'`
- Display with purple/pink gradient badge
- Shows organizer name (e.g., "Baker College", "Wiess College")
- Icon: Group/community icon

#### University Events
- Set with `eventCategory: 'university'`
- Display with orange/yellow gradient badge
- Shows organizer name (e.g., "Rice University", "Student Activities")
- Icon: University/academic building icon

### 3. Recurring Events

For weekly events like Pub nights:

**Fields:**
- `isRecurring: true` - Marks event as recurring
- `recurrencePattern: 'weekly'` or `'monthly'`
- `weeklyTheme: string` - The current week's theme

**Display:**
- Shows a cyan/blue "WEEKLY" or "MONTHLY" badge
- Displays theme in highlighted section: "This Week's Theme: [theme]"
- For Pub: Use "Theme TBA - Announced Monday" until theme is revealed

**Workflow for Pub Themes:**
1. Admin creates recurring weekly Pub event
2. Initial theme: "Theme TBA - Announced Monday"
3. Every Monday, admin updates `weeklyTheme` field with new theme
4. Theme displays prominently on event card and detail page

## Admin Usage

### Creating Public Events

1. Navigate to Admin Panel → Create Public Event
2. Select **Event Category**:
   - Residential College Event
   - University-Wide Event
3. Fill in **Organizer Name** (e.g., "Baker College", "Rice University")
4. Complete standard event fields
5. For recurring events:
   - Check "Recurring Event"
   - Select pattern (Weekly/Monthly)
   - Enter theme (use "Theme TBA - Announced Monday" for Pub if not yet announced)

### Updating Weekly Themes

To update a pub theme or recurring event theme:
1. Edit the event through admin panel
2. Update the "Weekly Theme" field
3. Save changes
4. Theme will display immediately to all users

## Database Schema

### Blog/Event Model Extensions

```javascript
{
  // Existing fields...
  eventCategory: {
    type: String,
    enum: ['user', 'residential_college', 'university'],
    default: 'user'
  },
  organizer: {
    type: String,
    required: false
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    type: String,
    enum: ['weekly', 'monthly', 'none'],
    default: 'none'
  },
  weeklyTheme: {
    type: String,
    default: ''
  },
  themeAnnouncementDate: {
    type: Date,
    required: false
  }
}
```

## UI/UX Design

### Event Card Display

**Official Badge:**
- Residential College: Purple/pink gradient with community icon
- University: Orange/yellow gradient with university icon

**Recurring Badge:**
- Cyan/blue gradient with rotation icon
- Shows "WEEKLY" or "MONTHLY"

**Theme Section:**
- Indigo/purple gradient background
- Clock icon
- Format: "This Week's Theme: [theme]"
- Only shows if theme is set

### Filter Behavior

**Public Tab:**
- Shows ALL public events regardless of status (future/live/past)
- Filters by `eventCategory === 'residential_college' OR 'university'`

**Other Tabs:**
- Future/Live/Past show ONLY user-created events
- Filters by `eventCategory === 'user'` AND matching status

## Example Use Cases

### Weekly Pub Night

```javascript
{
  title: "Friday Night Pub",
  eventCategory: "university",
  organizer: "Rice Pub",
  isRecurring: true,
  recurrencePattern: "weekly",
  weeklyTheme: "80s Night",
  // ... other fields
}
```

**Display:**
- Badge: "Rice University" (orange/yellow)
- Badge: "WEEKLY" (cyan/blue)  
- Theme section: "This Week's Theme: 80s Night"

### Residential College Public

```javascript
{
  title: "Baker College Spring Party",
  eventCategory: "residential_college",
  organizer: "Baker College",
  isRecurring: false,
  // ... other fields
}
```

**Display:**
- Badge: "Baker College" (purple/pink)
- Standard event display (no recurring indicators)

## Implementation Files

### Modified Files:
1. `/lib/models/blogmodel.js` - Added recurring event fields
2. `/components/bloglist.jsx` - Added Public tab and filter logic
3. `/components/blogitem.jsx` - Added badges and theme display
4. `/app/blogs/[id]/page.jsx` - Added badges and theme on detail page
5. `/app/admin/postevent/page.jsx` - Added recurring event form fields
6. `/app/api/blog/route.js` - Handle recurring fields in POST

## Future Enhancements

Potential additions:
- Auto-create next week's Pub event on Monday
- Email notifications when Pub theme is announced
- Recurring event series view (see all instances)
- Theme voting/suggestions from students
- Historical theme archive

## Notes

- Public events appear ONLY in the "Public" tab
- Student events appear in Future/Live/Past tabs
- This separation provides clear distinction between public and student activities
- Weekly themes can be updated anytime by admins without creating new events
