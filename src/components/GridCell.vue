<template>
  <div
    :class="classes"
    :style="cellStyles"
    :data-row="row"
    :data-col="col"
    @mousedown="handleMouseDown"
    @mouseover="handleMouseOver"
    @contextmenu.prevent="handleRightClick"
  >
    <span
      v-if="displayParkingNumber"
      :class="[
        'parking-number',
        { 'number-over-marker': isStart || isEnd || isPath },
      ]"
      >{{ displayParkingNumber }}</span
    >
  </div>
</template>

<script>
export default {
  name: "GridCell",
  props: {
    row: {
      type: Number,
      required: true,
    },
    col: {
      type: Number,
      required: true,
    },
    cellState: {
      type: Object,
      required: true,
    },
    isStart: {
      type: Boolean,
      default: false,
    },
    isEnd: {
      type: Boolean,
      default: false,
    },
    isPath: {
      type: Boolean,
      default: false,
    },
    pathAnimationDelay: {
      type: String,
      default: "0s",
    },
    parkingSpotId: {
      type: String,
      default: null,
    },
  },
  computed: {
    classes() {
      const classes = ["grid-cell"];

      if (this.cellState.type) {
        classes.push(this.cellState.type);
      }

      if (this.cellState.horizontalLine) {
        classes.push("parking-line-h");
      }

      if (this.cellState.verticalLine) {
        classes.push("parking-line-v");
      }

      // Add classes for pathfinding
      if (this.isStart) {
        classes.push("start-point");
      }

      if (this.isEnd) {
        classes.push("end-point");
      }

      if (this.isPath && !this.isStart && !this.isEnd) {
        classes.push("path");
      }

      return classes;
    },

    cellStyles() {
      // Only apply animation delay to path cells
      if (this.isPath && !this.isStart && !this.isEnd) {
        return {
          "animation-delay": this.pathAnimationDelay,
        };
      }
      return {};
    },

    displayParkingNumber() {
      // Show parking number only for parking spaces and open areas
      if (
        this.cellState.type !== "parking-space" &&
        this.cellState.type !== "open-area"
      ) {
        return null;
      }

      // Priority order:
      // 1. Manually set number in cell state
      // 2. CSV-based parking spot ID
      // 3. Default generated ID for parking spaces

      if (this.cellState.number) {
        return this.cellState.number;
      } else if (this.parkingSpotId) {
        return this.parkingSpotId;
      } else if (this.cellState.type === "parking-space") {
        return this.getDefaultParkingSpotId();
      }

      return null;
    },
  },
  methods: {
    handleMouseDown(e) {
      // Only handle left mouse button (button 0)
      if (e.button !== 0) return;

      e.preventDefault();
      this.$emit("cell-mouse-down", this.row, this.col);
    },

    handleMouseOver() {
      this.$emit("cell-mouse-over", this.row, this.col);
    },

    handleRightClick(e) {
      // Prevent the default context menu
      e.preventDefault();

      // Stop event propagation to prevent other event handlers from firing
      e.stopPropagation();

      const number = prompt(
        "Enter a number for this space:",
        this.cellState.number || ""
      );
      if (number !== null) {
        this.$emit("set-cell-number", this.row, this.col, number);
        // Reset mouse state to prevent unintended cell changes when moving mouse after right-click
        this.$emit("reset-mouse-state");
      }
    },

    // Function to generate a default spot ID based on row and column
    getDefaultParkingSpotId() {
      // Using alphabetical prefix for rows (A, B, C...) and numbers for columns
      const rowChar = String.fromCharCode(65 + Math.floor(this.row / 3));
      const spotNumber = Math.floor(this.col / 2) + 1;
      return `${rowChar}${spotNumber}`;
    },
  },
};
</script>
