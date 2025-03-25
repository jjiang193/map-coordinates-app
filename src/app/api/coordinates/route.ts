import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Path to our JSON "database" file
const dataFilePath = path.join(process.cwd(), 'data', 'coordinates.json');

// Ensure the data directory exists
const ensureDataDir = () => {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([]));
  }
};

// GET handler to retrieve all coordinates
export async function GET() {
  try {
    ensureDataDir();
    
    // Read the data file
    const data = fs.readFileSync(dataFilePath, 'utf8');
    const coordinates = JSON.parse(data);
    
    return NextResponse.json(coordinates);
  } catch (error) {
    console.error('Error reading coordinates:', error);
    return NextResponse.json({ error: 'Failed to retrieve coordinates' }, { status: 500 });
  }
}

// POST handler to save a new coordinate
export async function POST(request: NextRequest) {
  try {
    ensureDataDir();
    
    // Parse the request body
    const newCoordinate = await request.json();
    
    // Validate input
    if (!newCoordinate.x || !newCoordinate.y || !newCoordinate.label) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Read existing data
    const data = fs.readFileSync(dataFilePath, 'utf8');
    const coordinates = JSON.parse(data);
    
    // Add the new coordinate with a unique ID if not provided
    const coordinateToSave = {
      ...newCoordinate,
      id: newCoordinate.id || Date.now().toString(),
    };
    
    // Save the updated data
    fs.writeFileSync(
      dataFilePath,
      JSON.stringify([...coordinates, coordinateToSave])
    );
    
    return NextResponse.json(coordinateToSave, { status: 201 });
  } catch (error) {
    console.error('Error saving coordinate:', error);
    return NextResponse.json(
      { error: 'Failed to save coordinate' },
      { status: 500 }
    );
  }
}

// DELETE handler to remove a coordinate
export async function DELETE(request: NextRequest) {
  try {
    ensureDataDir();
    
    // Get the ID from the URL
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing coordinate ID' },
        { status: 400 }
      );
    }
    
    // Read existing data
    const data = fs.readFileSync(dataFilePath, 'utf8');
    const coordinates = JSON.parse(data);
    
    // Filter out the coordinate with the given ID
    const filteredCoordinates = coordinates.filter(
      (coord: { id: string }) => coord.id !== id
    );
    
    // If the lengths are the same, the ID wasn't found
    if (filteredCoordinates.length === coordinates.length) {
      return NextResponse.json(
        { error: 'Coordinate not found' },
        { status: 404 }
      );
    }
    
    // Save the updated data
    fs.writeFileSync(
      dataFilePath,
      JSON.stringify(filteredCoordinates)
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting coordinate:', error);
    return NextResponse.json(
      { error: 'Failed to delete coordinate' },
      { status: 500 }
    );
  }
} 