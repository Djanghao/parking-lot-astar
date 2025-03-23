<template>
  <div class="grid-container">
    <template v-for="(row, rowIndex) in grid" :key="rowIndex">
      <GridCell
        v-for="(cellState, colIndex) in row"
        :key="`${rowIndex}-${colIndex}`"
        :row="rowIndex"
        :col="colIndex"
        :cell-state="cellState"
        :is-start="
          startPoint &&
          startPoint.row === rowIndex &&
          startPoint.col === colIndex
        "
        :is-end="
          endPoint && endPoint.row === rowIndex && endPoint.col === colIndex
        "
        :is-path="isInPath(rowIndex, colIndex)"
        :path-animation-delay="getPathAnimationDelay(rowIndex, colIndex)"
        :parking-spot-id="getSpotId(rowIndex, colIndex)"
        @cell-mouse-down="onCellMouseDown"
        @cell-mouse-over="onCellMouseOver"
        @set-cell-number="onSetCellNumber"
        @reset-mouse-state="onResetMouseState"
      />
    </template>
  </div>
</template>

<script>
import GridCell from "./GridCell.vue";

export default {
  name: "Grid",
  components: {
    GridCell,
  },
  props: {
    grid: {
      type: Array,
      required: true,
    },
    startPoint: {
      type: Object,
      default: null,
    },
    endPoint: {
      type: Object,
      default: null,
    },
    path: {
      type: Array,
      default: () => [],
    },
    parkingSpotIds: {
      type: Array,
      default: () => [],
    },
    getSpotId: {
      type: Function,
      default: () => null,
    },
  },
  methods: {
    // Check if a cell is part of the path
    isInPath(row, col) {
      return this.path.some((point) => point.row === row && point.col === col);
    },

    // Get the path index of a cell if it's in the path
    getPathIndex(row, col) {
      return this.path.findIndex(
        (point) => point.row === row && point.col === col
      );
    },

    // Calculate animation delay for path cells based on their position in path
    getPathAnimationDelay(row, col) {
      const pathIndex = this.getPathIndex(row, col);
      if (pathIndex === -1) return 0;

      // Calculate delay - total animation time (0.3s) distributed among all cells in path
      // This ensures the last cell finishes animating exactly at 0.3s
      const totalPathLength = this.path.length;
      // Avoid division by zero and ensure delay is within reasonable bounds
      if (totalPathLength <= 1) return 0;

      // Calculate delay as a proportion of path length (0.3s total duration)
      const delayPerCell = 0.3 / (totalPathLength - 1);
      const delay = pathIndex * delayPerCell;

      // Ensure delay doesn't exceed 0.3s
      return Math.min(delay, 0.3).toFixed(3) + "s";
    },

    onCellMouseDown(row, col) {
      this.$emit("cell-mouse-down", row, col);
    },

    onCellMouseOver(row, col) {
      this.$emit("cell-mouse-over", row, col);
    },

    onSetCellNumber(row, col, number) {
      this.$emit("set-cell-number", row, col, number);
    },

    onResetMouseState() {
      this.$emit("reset-mouse-state");
    },
  },
};
</script>
