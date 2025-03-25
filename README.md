# Interactive World Map Application

This is a Next.js web application that allows users to interact with a world map by clicking on locations, adding labels, and saving the coordinates.

## Features

- Display a world map
- Two interaction modes:
  - Add Labels: Click to add markers with custom labels
  - Find Closest Label: Click to find the nearest existing marker
- Add labels to markers
- View saved coordinates in a table format
- Remove markers and their coordinates with a single click
- Persist coordinates using a simple JSON-based storage

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd map-coordinates-app
```

2. Install dependencies:
```bash
npm install
# or
yarn
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Usage

1. When the application loads, you'll see a world map in "Add Labels" mode.
2. You can switch between two modes using the mode toggle button:
   - **Add Labels Mode** (blue): 
     - Click anywhere on the map to start adding a marker.
     - A dialog will appear prompting you to add a label for the location.
     - Enter a label and click "Save" to add the marker to the map.
     - The marker will appear as a red dot on the map.
   - **Find Closest Label Mode** (green):
     - Click anywhere on the map to find the closest existing marker.
     - The closest marker will be highlighted in green.
     - Information about the closest marker will be displayed below the map.
     - The corresponding entry in the table will also be highlighted.
3. In either mode, you can hover over a marker to see its label.
4. You can remove a marker by clicking the "X" button next to its entry in the table.

## Technical Implementation

- Built with Next.js and TypeScript
- Uses the App Router architecture
- Styled with Tailwind CSS
- Simple JSON file-based storage for coordinates
- RESTful API for coordinate management

## Project Structure

- `src/app`: Main application pages and API routes
- `src/components`: React components, including the InteractiveMap component
- `public/images`: Map images and other static assets
- `data`: JSON storage for coordinates

## License

This project is licensed under the MIT License.
