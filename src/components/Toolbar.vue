<template>
  <div class="toolbar">
    <!-- 添加车位搜索功能，作为一个常规的类别 -->
    <div class="category">
      <div class="category-title">Spot Search</div>
      <div class="search-input-container">
        <input
          type="text"
          class="spot-search-input"
          v-model="spotIdToSearch"
          placeholder="Enter spot ID..."
          @keyup.enter="handleSpotSearch"
        />
        <button class="tool path-tool" @click="handleSpotSearch">
          Set as End
        </button>
      </div>
    </div>

    <div
      v-for="(category, index) in toolCategories"
      :key="index"
      class="category"
    >
      <div class="category-title">{{ category.name }}</div>
      <div class="category-tools">
        <button
          v-for="tool in category.tools"
          :key="tool.id"
          :id="tool.id"
          :class="[
            'tool',
            tool.className,
            activeTool === tool.id ? 'active' : '',
            tool.id === 'find-path' && isPathVisible ? 'path-visible' : '',
          ]"
          @click="handleToolClick(tool.id)"
        >
          {{
            tool.id === "find-path"
              ? isPathVisible
                ? "Hide Path"
                : "Find Path"
              : tool.label
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Toolbar",
  props: {
    activeTool: {
      type: String,
      required: true,
    },
    isPathVisible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      spotIdToSearch: "",
      toolCategories: [
        {
          name: "Areas",
          tools: [
            {
              id: "parking-space",
              label: "Parking Space",
              className: "areas-tool",
            },
            { id: "open-area", label: "Open Area", className: "areas-tool" },
            { id: "facility", label: "Facility", className: "areas-tool" },
          ],
        },
        {
          name: "Lines",
          tools: [
            {
              id: "parking-line-h",
              label: "Horizontal Line",
              className: "lines-tool",
            },
            {
              id: "parking-line-v",
              label: "Vertical Line",
              className: "lines-tool",
            },
          ],
        },
        {
          name: "Pathfinding",
          tools: [
            { id: "set-start", label: "Set Start", className: "path-tool" },
            { id: "set-end", label: "Set End", className: "path-tool" },
            { id: "find-path", label: "Find Path", className: "path-tool" },
          ],
        },
        {
          name: "Erasers",
          tools: [
            {
              id: "erase-space",
              label: "Erase Space",
              className: "erase-tool",
            },
            {
              id: "erase-line-h",
              label: "Erase H-Line",
              className: "erase-tool",
            },
            {
              id: "erase-line-v",
              label: "Erase V-Line",
              className: "erase-tool",
            },
            {
              id: "erase-number",
              label: "Erase Number",
              className: "erase-tool",
            },
            { id: "erase-all", label: "Erase All", className: "erase-tool" },
          ],
        },
        {
          name: "Actions",
          tools: [
            {
              id: "generate",
              label: "Generate Map",
              className: "generate-tool",
            },
            {
              id: "load-default",
              label: "Load Default",
              className: "load-default-tool",
            },
            { id: "clear", label: "Clear All", className: "clear-tool" },
            { id: "import", label: "Import Map", className: "import-tool" },
            { id: "export", label: "Export Map", className: "export-tool" },
          ],
        },
      ],
    };
  },
  methods: {
    handleSpotSearch() {
      if (this.spotIdToSearch.trim()) {
        this.$emit("search-spot", this.spotIdToSearch.trim());
      }
    },
    handleToolClick(toolId) {
      if (toolId === "clear") {
        // Ask for confirmation before clearing
        if (
          window.confirm("Are you sure you want to clear the entire design?")
        ) {
          this.$emit("clear-all");
        }
      } else if (toolId === "find-path") {
        // Directly toggle path visibility for find-path button
        this.$emit("toggle-path-visibility");
        this.$emit("update:activeTool", toolId);
      } else if (toolId === "import") {
        // Create a file input element and trigger click to open file dialog
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = ".json";
        fileInput.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              try {
                const mapData = JSON.parse(event.target.result);
                this.$emit("import-file", mapData);
              } catch (error) {
                alert("Invalid file format. Please upload a valid JSON file.");
                console.error("File import error:", error);
              }
            };
            reader.readAsText(file);
          }
        };
        fileInput.click();
      } else if (toolId === "export") {
        this.$emit("export-file");
      } else if (toolId === "generate") {
        // Ask for confirmation before generating a new map
        if (
          window.confirm(
            "Are you sure you want to generate a new parking lot? This will replace your current design."
          )
        ) {
          this.$emit("generate-map");
        }
      } else if (toolId === "load-default") {
        // Ask for confirmation before loading the default map
        if (
          window.confirm(
            "Are you sure you want to load the default parking lot layout? This will replace your current design."
          )
        ) {
          this.$emit("load-default-map");
        }
      } else {
        this.$emit("update:activeTool", toolId);
      }
    },
  },
};
</script>

<style scoped>
.search-input-container {
  display: flex;
  margin-top: 8px;
}

.spot-search-input {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-right: 5px;
  font-size: 14px;
}

.search-button {
  padding: 6px 10px;
  font-weight: normal;
}

/* Add additional styling for the integrated layout */
.toolbar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.category {
  border-bottom: 1px solid #eee;
  padding-bottom: 12px;
}

.category-title {
  font-weight: 600;
  color: #444;
  margin-bottom: 10px;
}

.category-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tool {
  flex: 0 0 auto;
  margin-bottom: 5px;
}
</style>
