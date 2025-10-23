# Bible Study Desktop Application

A powerful web-based Bible study application with split-screen viewing, highlighting, and note-taking capabilities. Study Scripture alongside PDF resources or compare multiple passages side-by-side.

## Features

### 📖 Bible Reading
- **Chapter View**: Read entire chapters with continuous text flow
- **Verse View**: Display verses line-by-line for detailed study
- **Book Navigation**: Browse all books of the Bible from the sidebar
- **Chapter Navigation**: Easy previous/next chapter buttons
- **Direct Chapter Access**: Jump to any chapter by number

### 🔍 Search & Lookup
- **Full-Text Search**: Search across the entire Bible text
- **Quick Navigation**: Click search results to jump directly to passages
- **Result Preview**: See verse context before navigating

### 📱 Split Screen Mode
- **Dual Panel Display**: View two resources simultaneously
- **Bible + Bible**: Compare different passages side-by-side
- **Bible + PDF**: Study Scripture alongside study guides, commentaries, or other PDF resources
- **Independent Navigation**: Each panel navigates independently

### ✨ Highlighting
- **Four Colors**: Yellow, green, blue, and pink highlighting options
- **Select & Highlight**: Simply select text and click a color
- **Remove Highlights**: Clear highlights easily
- **Persistent Storage**: Highlights saved automatically

### 📝 Note Taking
- **Verse-Level Notes**: Add notes to any verse
- **Inline Display**: Notes appear directly below verses
- **Edit & Delete**: Modify or remove notes anytime
- **Persistent Storage**: Notes saved automatically and persist across sessions

### 💾 Data Persistence
- **Automatic Saving**: All highlights and notes saved automatically
- **Local Storage**: Data stored in your browser (no server required)
- **Session Persistence**: Your work is preserved between visits

## Getting Started

### Prerequisites
- Node.js and npm installed
- A Bible text file in the correct format (see below)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd bible-study-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Bible File Format

The application requires Bible text files in a tab-delimited format:

```
[Translation Code]
[Translation Full Name]
[Reference][TAB][Verse Text]
[Reference][TAB][Verse Text]
...
```

**Example:**
```
KJV
King James Version
Genesis 1:1	In the beginning God created the heaven and the earth.
Genesis 1:2	And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.
John 3:16	For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.
```

**Reference Format:** `BookName Chapter:Verse`

Compatible with the format from [rrmhearts/bible-search](https://github.com/rrmhearts/bible-search) repository.

## How to Use

### Loading a Bible
1. Click the **"Load Bible"** button in the header
2. Select your Bible text file (.txt format)
3. The application will parse and load the Bible

### Searching
1. Type your search query in the sidebar search box
2. Press Enter or click the search icon
3. Click any result to navigate to that passage

### Highlighting Text
1. Select the text you want to highlight in any verse
2. Click one of the four color buttons that appear
3. The highlight is applied and saved automatically

### Adding Notes
1. Select text in a verse
2. Click the note icon (📝)
3. Type your note in the dialog
4. Click "Save"
5. Notes appear inline below the verse

### Split Screen
1. Click **"Split View"** to enable dual panels
2. The right panel can display:
   - Another Bible passage (select from dropdown)
   - A PDF document (click "Load PDF")
3. Navigate each panel independently
4. Click the X button to close the right panel

### View Modes
- **Chapter View**: Continuous reading format (like a traditional Bible)
- **Verse View**: Each verse on its own line (better for detailed study)
- Switch between modes using the dropdown in the header

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000).

The page will reload when you make changes.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder.

The build is optimized and minified for deployment.

### `npm run eject`
**Note: This is a one-way operation!**

Ejects from Create React App to give you full control over configuration.

## Technology Stack

- **React**: UI framework
- **Lucide React**: Icon library
- **Browser Storage API**: For persistent data storage
- **Create React App**: Build tooling

## Data Storage

All user data (highlights and notes) is stored locally in your browser using the Storage API. This means:
- ✅ No server or internet connection required
- ✅ Privacy - your notes stay on your device
- ✅ Fast access to your study materials
- ⚠️ Clearing browser data will remove your highlights and notes
- ⚠️ Data is specific to each browser/device

## Tips for Bible Study

1. **Comparative Study**: Use split screen to compare Old and New Testament passages
2. **Color Coding**: Develop a system (e.g., yellow for promises, blue for commands)
3. **Topical Study**: Search for a topic, highlight related verses, add notes with cross-references
4. **Chapter View**: Best for reading and understanding context
5. **Verse View**: Best for detailed analysis and memorization
6. **PDF Integration**: Load study guides, maps, or commentaries alongside Scripture

## Keyboard Shortcuts

- **Enter** (in search box): Execute search
- **Select text**: Automatically enables highlighting tools

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari

## Troubleshooting

### Bible file won't load
- Ensure the file is in tab-delimited format
- Check that references follow the pattern: `BookName Chapter:Verse`
- Make sure there are at least 2 header lines before verse content

### Highlights/notes not saving
- Check browser permissions for local storage
- Ensure you're not in private/incognito mode
- Try a different browser

### PDF not displaying
- Ensure the PDF file is not corrupted
- Try a smaller PDF file first
- Check browser console for errors

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Bible text format inspired by [rrmhearts/bible-search](https://github.com/rrmhearts/bible-search)
- Built with Create React App
- Icons by Lucide

## Support

For issues, questions, or suggestions, please open an issue on GitHub.