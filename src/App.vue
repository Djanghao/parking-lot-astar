<script>
import { ref, reactive, onMounted, watch, nextTick } from "vue";
import Grid from "./components/Grid.vue";
import Toolbar from "./components/Toolbar.vue";
import { findPath } from "./utils/pathfinding";
import { exportMap, validateMapData } from "./utils/mapIO";
import { generateParkingLotLayout } from "./utils/parkingLotGenerator";
import { parseCSV, getSpotIdFromCSV } from "./utils/csvParser";
import defaultParkingLotDesign from "./assets/parking-lot-design.json";
import "./styles/ParkingLotDesigner.css";

export default {
  name: "App",
  components: {
    Grid,
    Toolbar,
  },
  setup() {
    // Grid dimensions
    const ROWS = 20;
    const COLS = 30;

    // State for parking spot IDs from CSV
    const parkingSpotIds = ref([]);

    // Initialize grid with empty cells
    const initializeGrid = (customGrid = null) => {
      // If a custom grid is provided and it has correct dimensions, use it
      if (
        customGrid &&
        Array.isArray(customGrid) &&
        customGrid.length === ROWS &&
        customGrid[0].length === COLS
      ) {
        return customGrid;
      }

      // Otherwise, create a default empty grid
      const newGrid = [];
      for (let r = 0; r < ROWS; r++) {
        const row = [];
        for (let c = 0; c < COLS; c++) {
          row.push({
            type: "open-area",
            horizontalLine: false,
            verticalLine: false,
          });
        }
        newGrid.push(row);
      }
      return newGrid;
    };

    // State for the grid and tools
    const grid = ref(initializeGrid());
    const activeTool = ref("parking-space");
    const isMouseDown = ref(false);
    const startPoint = ref(null);
    const endPoint = ref(null);
    const path = ref([]);
    const isPathVisible = ref(false);

    // Function to load the CSV file with parking spot IDs
    const loadParkingSpotIdsFromCSV = async () => {
      try {
        // Load the CSV file from assets
        const response = await fetch("/src/assets/parking-lot-design.csv");

        if (!response.ok) {
          console.error("Failed to load CSV file:", response.statusText);
          return;
        }

        const csvContent = await response.text();
        // Parse the CSV content
        parkingSpotIds.value = parseCSV(csvContent);
        console.log("Parking spot IDs loaded from CSV:", parkingSpotIds.value);
      } catch (error) {
        console.error("Error loading parking spot IDs from CSV:", error);
      }
    };

    // Get a spot ID from the loaded CSV data
    const getSpotId = (row, col) => {
      return getSpotIdFromCSV(parkingSpotIds.value, row, col);
    };

    // 搜索车位并设置终点
    const handleSearchSpot = (spotId) => {
      // 在当前网格中查找拥有此编号的车位
      const matchingCells = [];

      // 首先在手动设置的number属性中查找
      for (let r = 0; r < grid.value.length; r++) {
        for (let c = 0; c < grid.value[r].length; c++) {
          const cell = grid.value[r][c];
          // 检查单元格是否有指定的编号
          if (cell.number === spotId) {
            matchingCells.push({ row: r, col: c });
          }
        }
      }

      // 如果在手动设置的编号中没有找到，则在CSV数据中查找
      if (matchingCells.length === 0) {
        for (let r = 0; r < parkingSpotIds.value.length; r++) {
          if (!parkingSpotIds.value[r]) continue;

          for (let c = 0; c < parkingSpotIds.value[r].length; c++) {
            if (parkingSpotIds.value[r][c] === spotId) {
              // 检查此位置的单元格是否为可通行区域或停车位
              if (r < grid.value.length && c < grid.value[r].length) {
                const cell = grid.value[r][c];
                if (
                  cell.type === "parking-space" ||
                  cell.type === "open-area"
                ) {
                  matchingCells.push({ row: r, col: c });
                }
              }
            }
          }
        }
      }

      // 如果找到了匹配的单元格，设置终点
      if (matchingCells.length > 0) {
        // 使用第一个匹配的单元格作为终点
        endPoint.value = matchingCells[0];

        // 如果已经设置了起点，自动计算路径
        if (startPoint.value) {
          calculatePath();
          isPathVisible.value = true;
        }

        alert(`End point set to spot "${spotId}" successfully!`);
      } else {
        alert(`No spot with ID "${spotId}" found!`);
      }
    };

    // Load default parking lot design when the component mounts
    onMounted(async () => {
      try {
        // First load the parking spot IDs from CSV
        await loadParkingSpotIdsFromCSV();

        // Then validate default map data
        const validationResult = validateMapData(
          defaultParkingLotDesign,
          ROWS,
          COLS
        );

        if (validationResult.valid) {
          // Initialize the grid with the default parking lot design
          grid.value = initializeGrid(defaultParkingLotDesign.grid);

          // Set pathfinding points if they exist in the default design
          startPoint.value = defaultParkingLotDesign.startPoint || null;
          endPoint.value = defaultParkingLotDesign.endPoint || null;
          path.value = [];
          isPathVisible.value = false;

          console.log("Default parking lot design loaded successfully");
        } else {
          console.error(
            "Invalid default parking lot design:",
            validationResult.message
          );
        }
      } catch (error) {
        console.error("Error loading default parking lot design:", error);
      }
    });

    // Calculate path
    const calculatePath = () => {
      if (startPoint.value && endPoint.value) {
        // First clear the path to reset animations
        path.value = [];

        // Use nextTick to ensure DOM updates before calculating new path
        // This ensures animation will restart
        nextTick(() => {
          const foundPath = findPath(
            startPoint.value,
            endPoint.value,
            grid.value,
            ROWS,
            COLS
          );
          path.value = foundPath || [];
        });
      }
    };

    // Dedicated function to toggle path visibility
    const togglePathVisibility = () => {
      if (startPoint.value && endPoint.value) {
        // If we're about to show the path, make sure it's calculated
        if (!isPathVisible.value) {
          calculatePath();
        }
        isPathVisible.value = !isPathVisible.value;
      } else {
        alert("Please set start and end points first!");
      }
    };

    // Apply the selected tool to a cell
    const applyTool = (row, col) => {
      if (activeTool.value === "set-start") {
        startPoint.value = { row, col };
        // If both start and end points are set, calculate path
        if (endPoint.value) {
          calculatePath();
        }
        return;
      }

      if (activeTool.value === "set-end") {
        endPoint.value = { row, col };
        // Calculate and show path when setting new endpoint
        if (startPoint.value) {
          calculatePath();
          isPathVisible.value = true; // Automatically show path when setting end point
        }
        return;
      }

      if (activeTool.value === "find-path") {
        togglePathVisibility();
        return;
      }

      // Create a copy of the grid and update it
      const newGrid = [...grid.value];
      const cell = { ...newGrid[row][col] };

      switch (activeTool.value) {
        case "parking-space":
          cell.type = "parking-space";
          break;
        case "open-area":
          cell.type = "open-area";
          break;
        case "facility":
          cell.type = "facility";
          break;
        case "parking-line-h":
          cell.horizontalLine = true;
          break;
        case "parking-line-v":
          cell.verticalLine = true;
          break;
        case "erase-space":
          cell.type = "open-area";
          break;
        case "erase-line-h":
          cell.horizontalLine = false;
          break;
        case "erase-line-v":
          cell.verticalLine = false;
          break;
        case "erase-number":
          cell.number = null;
          break;
        case "erase-all":
          cell.type = "open-area";
          cell.horizontalLine = false;
          cell.verticalLine = false;
          cell.number = null;
          break;
        default:
          break;
      }

      newGrid[row][col] = cell;
      grid.value = newGrid;
    };

    // Recalculate path when start or end point changes, if path is visible
    watch([startPoint, endPoint], () => {
      if (isPathVisible.value) {
        calculatePath();
      }
    });

    // When grid changes, if start or end point is changed to an obstacle, clear the corresponding point and path
    watch(
      grid,
      () => {
        let needUpdate = false;

        if (
          startPoint.value &&
          grid.value[startPoint.value.row][startPoint.value.col].type !==
            "open-area" &&
          grid.value[startPoint.value.row][startPoint.value.col].type !==
            "parking-space"
        ) {
          startPoint.value = null;
          needUpdate = true;
        }

        if (
          endPoint.value &&
          grid.value[endPoint.value.row][endPoint.value.col].type !==
            "open-area" &&
          grid.value[endPoint.value.row][endPoint.value.col].type !==
            "parking-space"
        ) {
          endPoint.value = null;
          needUpdate = true;
        }

        if (
          !needUpdate &&
          isPathVisible.value &&
          startPoint.value &&
          endPoint.value
        ) {
          calculatePath();
        }
      },
      { deep: true }
    );

    // Handle cell mouse down event
    const handleCellMouseDown = (row, col) => {
      isMouseDown.value = true;
      applyTool(row, col);
    };

    // Handle cell mouse over event
    const handleCellMouseOver = (row, col) => {
      if (isMouseDown.value) {
        applyTool(row, col);
      }
    };

    // Handle mouse up event to stop drawing
    const handleMouseUp = () => {
      isMouseDown.value = false;
    };

    // Handle reset mouse state event (triggered after right-click)
    const handleResetMouseState = () => {
      isMouseDown.value = false;
    };

    onMounted(() => {
      document.addEventListener("mouseup", handleMouseUp);
    });

    // Handle clear all
    const handleClearAll = () => {
      grid.value = initializeGrid();
      startPoint.value = null;
      endPoint.value = null;
      path.value = [];
      isPathVisible.value = false; // Reset path visibility when clearing
    };

    // Handle export file
    const handleExportFile = () => {
      const success = exportMap(grid.value, startPoint.value, endPoint.value);
      if (success) {
        alert("Map exported successfully!");
      } else {
        alert("Error exporting map. Please try again.");
      }
    };

    // Handle import file
    const handleImportFile = (mapData) => {
      try {
        // Validate map data
        const validationResult = validateMapData(mapData, ROWS, COLS);

        if (!validationResult.valid) {
          throw new Error(validationResult.message);
        }

        // Set grid data
        grid.value = mapData.grid;
        startPoint.value = mapData.startPoint || null;
        endPoint.value = mapData.endPoint || null;
        path.value = [];
        isPathVisible.value = false;

        alert("Map imported successfully!");
      } catch (error) {
        alert(`Error importing map: ${error.message}`);
        console.error("Import error:", error);
      }
    };

    // Handle generate map
    const handleGenerateMap = () => {
      const generatedGrid = generateParkingLotLayout(ROWS, COLS);
      grid.value = generatedGrid;
      startPoint.value = null;
      endPoint.value = null;
      path.value = [];
      isPathVisible.value = false;
    };

    // Handle load default map
    const handleLoadDefaultMap = () => {
      try {
        // Validate default map data
        const validationResult = validateMapData(
          defaultParkingLotDesign,
          ROWS,
          COLS
        );

        if (validationResult.valid) {
          // Initialize the grid with the default parking lot design
          grid.value = defaultParkingLotDesign.grid;

          // Set pathfinding points if they exist in the default design
          startPoint.value = defaultParkingLotDesign.startPoint || null;
          endPoint.value = defaultParkingLotDesign.endPoint || null;
          path.value = [];
          isPathVisible.value = false;

          console.log("Default parking lot design loaded successfully");
        } else {
          console.error(
            "Invalid default parking lot design:",
            validationResult.message
          );
          alert(
            `Invalid default parking lot design: ${validationResult.message}`
          );
        }
      } catch (error) {
        console.error("Error loading default parking lot design:", error);
        alert(`Error loading default parking lot design: ${error.message}`);
      }
    };

    // Handle cell number setting
    const handleSetCellNumber = (row, col, number) => {
      const newGrid = [...grid.value];
      const cell = { ...newGrid[row][col] };
      // Only update the number property, preserving the original cell type
      cell.number = number === "" ? null : number;
      newGrid[row][col] = cell;
      grid.value = newGrid;
    };

    return {
      grid,
      activeTool,
      startPoint,
      endPoint,
      path,
      isPathVisible,
      parkingSpotIds,
      getSpotId,
      handleCellMouseDown,
      handleCellMouseOver,
      handleClearAll,
      togglePathVisibility,
      handleImportFile,
      handleExportFile,
      handleGenerateMap,
      handleLoadDefaultMap,
      handleSetCellNumber,
      handleResetMouseState,
      handleSearchSpot,
    };
  },
};
</script>

<template>
  <div class="app">
    <h1 class="app-title">Parking Lot Designer</h1>
    <div class="integrated-container">
      <Toolbar
        :active-tool="activeTool"
        :is-path-visible="isPathVisible"
        @update:active-tool="activeTool = $event"
        @clear-all="handleClearAll"
        @toggle-path-visibility="togglePathVisibility"
        @import-file="handleImportFile"
        @export-file="handleExportFile"
        @generate-map="handleGenerateMap"
        @load-default-map="handleLoadDefaultMap"
        @search-spot="handleSearchSpot"
      />
      <div class="grid-wrapper">
        <Grid
          :grid="grid"
          :start-point="startPoint"
          :end-point="endPoint"
          :path="isPathVisible ? path : []"
          :parking-spot-ids="parkingSpotIds"
          :get-spot-id="getSpotId"
          @cell-mouse-down="handleCellMouseDown"
          @cell-mouse-over="handleCellMouseOver"
          @set-cell-number="handleSetCellNumber"
          @reset-mouse-state="handleResetMouseState"
        />
      </div>
    </div>
  </div>
</template>

<style>
@import "./styles/ParkingLotDesigner.css";
</style>
