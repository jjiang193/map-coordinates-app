interface Point {
  id: string;
  x: number;
  y: number;
  [key: string]: any;
}

class KDNode {
  point: Point | null;
  left: KDNode | null;
  right: KDNode | null;
  
  constructor(point: Point | null = null) {
    this.point = point;
    this.left = null;
    this.right = null;
  }
}

export class KDTree {
  root: KDNode | null;
  points: Map<string, Point>;
  
  constructor() {
    this.root = null;
    this.points = new Map();
  }
  
  // Build the tree from scratch with a set of points
  build(points: Point[]): void {
    this.points.clear();
    points.forEach(point => this.points.set(point.id, point));
    this.root = this._buildTree(points, 0);
  }
  
  // Insert a new point into the tree
  insert(point: Point): void {
    this.points.set(point.id, point);
    if (!this.root) {
      this.root = new KDNode(point);
      return;
    }
    
    this._insertNode(this.root, point, 0);
  }
  
  // Remove a point from the tree
  remove(id: string): boolean {
    const point = this.points.get(id);
    if (!point) return false;
    
    this.points.delete(id);
    
    // Rebuild the tree - for simplicity, we'll rebuild the entire tree
    // A more efficient approach would be to only rebuild the affected subtree
    const points = Array.from(this.points.values());
    this.root = this._buildTree(points, 0);
    
    return true;
  }
  
  // Find the nearest neighbor to a given point
  findNearest(x: number, y: number): Point | null {
    if (!this.root || this.points.size === 0) return null;
    
    const targetPoint = { id: 'target', x, y };
    let nearest: Point | null = null;
    let bestDist = Infinity;
    
    // Helper function to update best match
    const updateBest = (point: Point, dist: number) => {
      if (dist < bestDist) {
        bestDist = dist;
        nearest = point;
      }
      return bestDist; // Return the updated best distance
    };
    
    // Start recursive search
    this._findNearestHelper(this.root, targetPoint, 0, updateBest);
    
    return nearest;
  }
  
  // Private: Build tree recursively
  private _buildTree(points: Point[], depth: number): KDNode | null {
    if (points.length === 0) return null;
    
    // Sort by x or y depending on depth
    const axis = depth % 2;
    points.sort((a, b) => (axis === 0 ? a.x - b.x : a.y - b.y));
    
    // Select median as pivot
    const medianIdx = Math.floor(points.length / 2);
    const node = new KDNode(points[medianIdx]);
    
    // Build left and right subtrees
    node.left = this._buildTree(points.slice(0, medianIdx), depth + 1);
    node.right = this._buildTree(points.slice(medianIdx + 1), depth + 1);
    
    return node;
  }
  
  // Private: Insert a node recursively
  private _insertNode(node: KDNode, point: Point, depth: number): void {
    const axis = depth % 2;
    
    if (axis === 0) {
      if (point.x < (node.point?.x ?? 0)) {
        if (node.left) {
          this._insertNode(node.left, point, depth + 1);
        } else {
          node.left = new KDNode(point);
        }
      } else {
        if (node.right) {
          this._insertNode(node.right, point, depth + 1);
        } else {
          node.right = new KDNode(point);
        }
      }
    } else {
      if (point.y < (node.point?.y ?? 0)) {
        if (node.left) {
          this._insertNode(node.left, point, depth + 1);
        } else {
          node.left = new KDNode(point);
        }
      } else {
        if (node.right) {
          this._insertNode(node.right, point, depth + 1);
        } else {
          node.right = new KDNode(point);
        }
      }
    }
  }
  
  // Private helper for findNearest
  private _findNearestHelper(
    node: KDNode | null,
    target: Point,
    depth: number,
    updateBest: (point: Point, dist: number) => number
  ): void {
    if (!node) return;
    
    const axis = depth % 2;
    
    // Calculate distance to current node's point
    let currentBest = Infinity;
    if (node.point) {
      const dist = this._distance(node.point, target);
      currentBest = updateBest(node.point, dist);
    }
    
    // Determine which side to search first
    let nextBranch: KDNode | null = null;
    let otherBranch: KDNode | null = null;
    
    if (axis === 0) {
      if (target.x < (node.point?.x ?? 0)) {
        nextBranch = node.left;
        otherBranch = node.right;
      } else {
        nextBranch = node.right;
        otherBranch = node.left;
      }
    } else {
      if (target.y < (node.point?.y ?? 0)) {
        nextBranch = node.left;
        otherBranch = node.right;
      } else {
        nextBranch = node.right;
        otherBranch = node.left;
      }
    }
    
    // Search the preferred branch first
    this._findNearestHelper(nextBranch, target, depth + 1, updateBest);
    
    // Check if we need to search the other branch
    const axisDistance = axis === 0 
      ? Math.abs((node.point?.x ?? 0) - target.x) 
      : Math.abs((node.point?.y ?? 0) - target.y);
    
    // Get the current best distance
    currentBest = updateBest(node.point!, Infinity); // This won't update but will return the current best
    
    // Only search the other branch if it could contain a closer point
    if (axisDistance < currentBest) {
      this._findNearestHelper(otherBranch, target, depth + 1, updateBest);
    }
  }
  
  // Calculate Euclidean distance between two points
  private _distance(a: Point, b: Point): number {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  }
} 