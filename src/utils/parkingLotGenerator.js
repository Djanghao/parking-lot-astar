/**
 * Utility for generating complex parking lot layouts
 */

/**
 * Generate a complex parking lot layout
 * @param {number} rows - Number of rows in the grid
 * @param {number} cols - Number of columns in the grid
 * @returns {Array} - Generated grid with parking spaces and lines
 */
export const generateParkingLotLayout = (rows, cols) => {
  // Initialize empty grid
  const grid = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        type: "open-area",
        horizontalLine: false,
        verticalLine: false,
      });
    }
    grid.push(row);
  }

  // Create sections for different parking areas
  createMainSection(grid, rows, cols);
  createFacilitiesArea(grid, rows, cols);

  return grid;
};

/**
 * Create the main parking section with horizontal spaces
 * @param {Array} grid - The grid to modify
 * @param {number} rows - Number of rows in the grid
 * @param {number} cols - Number of columns in the grid
 */
const createMainSection = (grid, rows, cols) => {
  // Define the main parking area dimensions (approximately 70% of the grid)
  const parkingStartRow = Math.floor(rows * 0.1);
  const parkingEndRow = Math.floor(rows * 0.9);
  const parkingStartCol = Math.floor(cols * 0.1);
  const parkingEndCol = Math.floor(cols * 0.7);

  // Create horizontal parking spots (2x1 each) with driving lanes in between
  for (let r = parkingStartRow; r < parkingEndRow; r += 3) {
    // Skip some rows to create driving lanes
    if ((r - parkingStartRow) % 9 === 0) continue;

    for (let c = parkingStartCol; c < parkingEndCol; c += 2) {
      // Draw horizontal lines for spaces
      if (c < parkingEndCol - 1) {
        grid[r][c].type = "parking-space";
        grid[r][c + 1].type = "parking-space";

        // Add lines around the parking space
        if (r > 0) grid[r - 1][c].horizontalLine = true;
        if (r > 0) grid[r - 1][c + 1].horizontalLine = true;
        grid[r + 1][c].horizontalLine = true;
        grid[r + 1][c + 1].horizontalLine = true;
        grid[r][c].verticalLine = true;
        grid[r][c + 1].verticalLine = true;
        grid[r][c + 2].verticalLine = true;
      }
    }
  }

  // Create vertical borders for the driving lanes
  for (let r = parkingStartRow - 1; r <= parkingEndRow; r++) {
    grid[r][parkingStartCol - 1].verticalLine = true;
    grid[r][parkingEndCol].verticalLine = true;
  }
};

/**
 * Create facilities area with vertical parking spaces
 * @param {Array} grid - The grid to modify
 * @param {number} rows - Number of rows in the grid
 * @param {number} cols - Number of columns in the grid
 */
const createFacilitiesArea = (grid, rows, cols) => {
  // Define the facilities area on the right side
  const facilityStartRow = Math.floor(rows * 0.1);
  const facilityEndRow = Math.floor(rows * 0.9);
  const facilityStartCol = Math.floor(cols * 0.75);
  const facilityEndCol = Math.floor(cols * 0.95);

  // Create vertical parking spaces (1x2 each)
  for (let c = facilityStartCol; c < facilityEndCol; c += 3) {
    // Skip some columns to create driving lanes
    if ((c - facilityStartCol) % 9 === 0) continue;

    for (let r = facilityStartRow; r < facilityEndRow - 1; r += 2) {
      grid[r][c].type = "parking-space";
      grid[r + 1][c].type = "parking-space";

      // Add lines around the parking space
      if (c > 0) grid[r][c - 1].verticalLine = true;
      if (c > 0) grid[r + 1][c - 1].verticalLine = true;
      grid[r][c + 1].verticalLine = true;
      grid[r + 1][c + 1].verticalLine = true;
      grid[r][c].horizontalLine = true;
      grid[r + 1][c].horizontalLine = true;
      grid[r + 2][c].horizontalLine = true;
    }
  }

  // Create building facilities area
  const buildingStartRow = Math.floor(rows * 0.2);
  const buildingEndRow = Math.floor(rows * 0.4);
  const buildingStartCol = Math.floor(cols * 0.8);
  const buildingEndCol = Math.floor(cols * 0.9);

  for (let r = buildingStartRow; r < buildingEndRow; r++) {
    for (let c = buildingStartCol; c < buildingEndCol; c++) {
      grid[r][c].type = "facility";
    }
  }

  // Add entrance/exit
  const entranceRow = Math.floor(rows * 0.5);
  for (let c = facilityStartCol - 2; c < facilityStartCol + 3; c++) {
    grid[entranceRow][c].type = "open-area";
    grid[entranceRow - 1][c].horizontalLine = true;
    grid[entranceRow + 1][c].horizontalLine = true;
  }
};
