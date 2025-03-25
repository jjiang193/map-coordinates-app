'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { KDTree } from '@/utils/KDTree';
import { storageService } from '@/utils/storage';
import { Coordinate } from '@/types/Coordinate';

type Mode = 'add' | 'find';

export default function InteractiveMap() {
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [newLabel, setNewLabel] = useState('');
  const [activeCoordinate, setActiveCoordinate] = useState<Omit<Coordinate, 'label' | 'id'> | null>(null);
  const [showLabelInput, setShowLabelInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('add');
  const [closestCoordinateId, setClosestCoordinateId] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const kdTreeRef = useRef<KDTree>(new KDTree());

  // Fetch all coordinates when the component mounts
  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        setLoading(true);
        const data = await storageService.getAll();
        setCoordinates(data);
        
        // Build the KD-tree with the fetched coordinates
        kdTreeRef.current.build(data);
      } catch (error) {
        console.error('Error fetching coordinates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoordinates();
  }, []);

  // Find the closest coordinate using KD-tree
  const findClosestCoordinate = (x: number, y: number): string | null => {
    const nearest = kdTreeRef.current.findNearest(x, y);
    return nearest ? nearest.id : null;
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (mode === 'add') {
      // Set the active coordinate for which we'll collect a label
      setActiveCoordinate({ x, y });
      setShowLabelInput(true);
      // Reset closest coordinate highlight when in add mode
      setClosestCoordinateId(null);
    } else if (mode === 'find') {
      // Find the closest coordinate using KD-tree
      const closestId = findClosestCoordinate(x, y);
      setClosestCoordinateId(closestId);
      // Reset active coordinate and label input when in find mode
      setActiveCoordinate(null);
      setShowLabelInput(false);
    }
  };

  const handleLabelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeCoordinate && newLabel) {
      try {
        setLoading(true);
        
        const savedCoordinate = await storageService.save({
          x: activeCoordinate.x,
          y: activeCoordinate.y,
          label: newLabel
        });
        
        // Update state with the new coordinate
        setCoordinates(prev => [...prev, savedCoordinate]);
        
        // Add the new coordinate to the KD-tree
        kdTreeRef.current.insert(savedCoordinate);
      } catch (error) {
        console.error('Error saving coordinate:', error);
      } finally {
        setLoading(false);
        setNewLabel('');
        setShowLabelInput(false);
        setActiveCoordinate(null);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      const success = await storageService.delete(id);

      if (success) {
        // Filter out the deleted coordinate
        setCoordinates(prev => prev.filter(coord => coord.id !== id));
        
        // Remove the coordinate from the KD-tree
        kdTreeRef.current.remove(id);
        
        // Reset closest coordinate highlight if it was deleted
        if (closestCoordinateId === id) {
          setClosestCoordinateId(null);
        }
      } else {
        console.error('Failed to delete coordinate');
      }
    } catch (error) {
      console.error('Error deleting coordinate:', error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 mt-8">
      <h1 className="text-2xl font-bold">Interactive World Map</h1>
      
      <div className="flex flex-col items-center mb-6">
        <div className="text-center mb-2">Mode Selection:</div>
        <div className="flex bg-gray-100 p-1 rounded-lg shadow-sm">
          <button
            onClick={() => {
              setMode('add');
              // Reset states when changing modes
              setClosestCoordinateId(null);
              setActiveCoordinate(null);
              setShowLabelInput(false);
            }}
            className={`px-4 py-2 rounded-md transition-colors ${
              mode === 'add' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Add Labels
          </button>
          <button
            onClick={() => {
              setMode('find');
              // Reset states when changing modes
              setClosestCoordinateId(null);
              setActiveCoordinate(null);
              setShowLabelInput(false);
            }}
            className={`px-4 py-2 rounded-md transition-colors ${
              mode === 'find' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Find Closest Label
          </button>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          {mode === 'add' 
            ? 'Click on the map to add a new label' 
            : 'Click on the map to find the closest existing label'}
        </div>
      </div>
      
      {loading && <p className="text-blue-500">Loading...</p>}
      
      <div className="relative" ref={mapRef} onClick={handleMapClick}>
        <Image 
          src="/images/map.webp" 
          alt="World Map"
          width={1000}
          height={500}
          className="cursor-crosshair"
          unoptimized  // Add this to allow using external images
        />
        
        {/* Display all saved coordinates as red dots */}
        {coordinates.map((coord) => (
          <div
            key={coord.id}
            className={`absolute w-4 h-4 rounded-full transform -translate-x-2 -translate-y-2 hover:w-5 hover:h-5 transition-all ${
              coord.id === closestCoordinateId 
                ? 'bg-green-500 w-5 h-5' 
                : 'bg-red-500'
            }`}
            style={{ left: `${coord.x}px`, top: `${coord.y}px` }}
            title={coord.label}
          />
        ))}
        
        {/* Display temporary marker for active coordinate */}
        {activeCoordinate && (
          <div
            className="absolute w-4 h-4 bg-red-500 rounded-full transform -translate-x-2 -translate-y-2 opacity-70"
            style={{ left: `${activeCoordinate.x}px`, top: `${activeCoordinate.y}px` }}
          />
        )}
      </div>
      
      {/* Label input dialog */}
      {showLabelInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Add a label for this location</h2>
            <form onSubmit={handleLabelSubmit}>
              <div className="mb-4">
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter a label (e.g., City name)"
                  autoFocus
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowLabelInput(false);
                    setActiveCoordinate(null);
                  }}
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Display information about the closest coordinate */}
      {mode === 'find' && closestCoordinateId && (
        <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-md">
          <h3 className="text-lg font-medium text-green-800">Closest Label Found</h3>
          {coordinates.filter(coord => coord.id === closestCoordinateId).map(coord => (
            <div key={coord.id} className="mt-2">
              <p><strong>Label:</strong> {coord.label}</p>
              <p><strong>Coordinates:</strong> X: {coord.x.toFixed(2)}, Y: {coord.y.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
      
      {/* Table showing saved coordinates */}
      {coordinates.length > 0 && (
        <div className="w-full max-w-3xl mt-6">
          <h2 className="text-xl font-semibold mb-2">Saved Coordinates</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">ID</th>
                  <th className="py-2 px-4 border-b">X</th>
                  <th className="py-2 px-4 border-b">Y</th>
                  <th className="py-2 px-4 border-b">Label</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coordinates.map((coord) => (
                  <tr key={coord.id} className={coord.id === closestCoordinateId ? "bg-green-100" : ""}>
                    <td className="py-2 px-4 border-b">{coord.id}</td>
                    <td className="py-2 px-4 border-b">{coord.x.toFixed(2)}</td>
                    <td className="py-2 px-4 border-b">{coord.y.toFixed(2)}</td>
                    <td className="py-2 px-4 border-b">{coord.label}</td>
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => handleDelete(coord.id)}
                        disabled={deletingId === coord.id}
                        className="p-1 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                        title="Remove coordinate"
                      >
                        {deletingId === coord.id ? '...' : 'X'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 