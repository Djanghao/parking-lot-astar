/**
 * Utility functions for map import/export operations
 */

/**
 * Export the current map state to a JSON file
 * @param {Array} grid - The current grid data
 * @param {Object} startPoint - The current start point coordinates
 * @param {Object} endPoint - The current end point coordinates
 */
export const exportMap = (grid, startPoint, endPoint) => {
  try {
    // Create map data object
    const mapData = {
      grid,
      startPoint,
      endPoint,
      version: "1.0", // For future compatibility
      exportDate: new Date().toISOString(),
    };

    // Convert to JSON string
    const mapJson = JSON.stringify(mapData, null, 2);

    // Create a Blob with the JSON data
    const blob = new Blob([mapJson], { type: "application/json" });

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a temporary link element
    const link = document.createElement("a");
    link.href = url;
    link.download = `parking-lot-design-${
      new Date().toISOString().split("T")[0]
    }.json`;

    // Append to body, click, and then remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Release the URL object
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Error exporting map:", error);
    return false;
  }
};

/**
 * Validate map data format
 * @param {Object} mapData - The imported map data
 * @param {number} expectedRows - Expected number of rows
 * @param {number} expectedCols - Expected number of columns
 * @returns {Object} - Validation result
 */
export const validateMapData = (mapData, expectedRows, expectedCols) => {
  if (!mapData || typeof mapData !== "object") {
    return { valid: false, message: "Invalid map data format" };
  }

  if (!mapData.grid || !Array.isArray(mapData.grid)) {
    return { valid: false, message: "Missing or invalid grid data" };
  }

  const actualRows = mapData.grid.length;
  if (actualRows !== expectedRows) {
    return {
      valid: false,
      message: `Row count mismatch: expected ${expectedRows}, got ${actualRows}`,
    };
  }

  const rowLengths = mapData.grid.map((row) => row.length);
  const allRowsHaveCorrectLength = rowLengths.every(
    (length) => length === expectedCols
  );
  if (!allRowsHaveCorrectLength) {
    return {
      valid: false,
      message: `Column count mismatch: expected all rows to have ${expectedCols} columns`,
    };
  }

  // Validate cell structure
  for (let r = 0; r < actualRows; r++) {
    for (let c = 0; c < mapData.grid[r].length; c++) {
      const cell = mapData.grid[r][c];
      if (
        !cell ||
        typeof cell !== "object" ||
        !("type" in cell) ||
        !("horizontalLine" in cell) ||
        !("verticalLine" in cell)
      ) {
        return {
          valid: false,
          message: `Invalid cell data at position [${r},${c}]`,
        };
      }
    }
  }

  // Validate startPoint and endPoint if they exist
  if (
    mapData.startPoint &&
    (typeof mapData.startPoint !== "object" ||
      !("row" in mapData.startPoint) ||
      !("col" in mapData.startPoint) ||
      mapData.startPoint.row < 0 ||
      mapData.startPoint.row >= expectedRows ||
      mapData.startPoint.col < 0 ||
      mapData.startPoint.col >= expectedCols)
  ) {
    return { valid: false, message: "Invalid start point coordinates" };
  }

  if (
    mapData.endPoint &&
    (typeof mapData.endPoint !== "object" ||
      !("row" in mapData.endPoint) ||
      !("col" in mapData.endPoint) ||
      mapData.endPoint.row < 0 ||
      mapData.endPoint.row >= expectedRows ||
      mapData.endPoint.col < 0 ||
      mapData.endPoint.col >= expectedCols)
  ) {
    return { valid: false, message: "Invalid end point coordinates" };
  }

  return { valid: true };
};
