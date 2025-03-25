import { Coordinate } from '@/types/Coordinate';

const STORAGE_KEY = 'map-coordinates';

class StorageService {
  // Check if we're running in a static environment (like GitHub Pages)
  private isStaticEnv = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
  
  // Get all coordinates
  async getAll(): Promise<Coordinate[]> {
    if (this.isStaticEnv) {
      // In static environment, use localStorage
      return this.getAllFromLocalStorage();
    } else {
      // In development or server environment, use API
      try {
        const response = await fetch('/api/coordinates');
        if (!response.ok) {
          throw new Error('Failed to fetch coordinates');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching coordinates:', error);
        return [];
      }
    }
  }
  
  // Save a new coordinate
  async save(coordinate: Omit<Coordinate, 'id'>): Promise<Coordinate> {
    const newCoordinate: Coordinate = {
      ...coordinate,
      id: Date.now().toString(),
    };
    
    if (this.isStaticEnv) {
      // In static environment, use localStorage
      return this.saveToLocalStorage(newCoordinate);
    } else {
      // In development or server environment, use API
      try {
        const response = await fetch('/api/coordinates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newCoordinate),
        });
        
        if (!response.ok) {
          throw new Error('Failed to save coordinate');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error saving coordinate:', error);
        throw error;
      }
    }
  }
  
  // Delete a coordinate
  async delete(id: string): Promise<boolean> {
    if (this.isStaticEnv) {
      // In static environment, use localStorage
      return this.deleteFromLocalStorage(id);
    } else {
      // In development or server environment, use API
      try {
        const response = await fetch(`/api/coordinates?id=${id}`, {
          method: 'DELETE',
        });
        
        return response.ok;
      } catch (error) {
        console.error('Error deleting coordinate:', error);
        return false;
      }
    }
  }
  
  // LocalStorage implementation
  private getAllFromLocalStorage(): Coordinate[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored) as Coordinate[];
    } catch (error) {
      console.error('Error parsing stored coordinates:', error);
      return [];
    }
  }
  
  private saveToLocalStorage(coordinate: Coordinate): Coordinate {
    const coordinates = this.getAllFromLocalStorage();
    coordinates.push(coordinate);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(coordinates));
    return coordinate;
  }
  
  private deleteFromLocalStorage(id: string): boolean {
    const coordinates = this.getAllFromLocalStorage();
    const filteredCoordinates = coordinates.filter(
      (coordinate) => coordinate.id !== id
    );
    
    // If lengths are the same, the ID wasn't found
    if (filteredCoordinates.length === coordinates.length) {
      return false;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredCoordinates));
    return true;
  }
}

export const storageService = new StorageService(); 