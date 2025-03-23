# Parking Lot Designer (Vue 3)

An interactive web application for designing and visualizing parking lot layouts, built with Vue 3. This application allows users to create, edit, and analyze parking lot designs with pathfinding capabilities.

## Features

- **Interactive Grid System**: Create and edit parking spaces, roads, and facilities
- **Line Drawing Tools**: Add horizontal and vertical lines to mark parking boundaries
- **Pathfinding Algorithm**: Calculate the optimal path between two points using the A\* algorithm
- **Import/Export**: Save your designs as JSON files and load them later
- **Responsive Design**: Works on various screen sizes

## Tools

- **Areas**: Create different types of spaces (parking spaces, open areas, facilities)
- **Lines**: Add horizontal and vertical lines to designate parking boundaries
- **Pathfinding**: Set start and end points, and find the optimal path between them
- **Erasers**: Remove spaces, lines, or clear the entire design
- **Actions**: Generate a sample layout, import/export designs, and more

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or higher recommended)
- npm (v6.0.0 or higher)

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/parking-lot-designer-vue.git
   cd parking-lot-designer-vue
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the development server:

   ```
   npm run dev
   ```

4. Build for production:
   ```
   npm run build
   ```

## Usage Guide

1. **Select a tool** from the toolbar on the left
2. **Click on the grid** to apply the selected tool
3. **Click and drag** to apply the tool to multiple cells
4. To find a path:
   - First set a start point (green)
   - Then set an end point (red)
   - Click "Find Path" to display the optimal route (purple)
5. Use the import/export tools to save and load your designs

## Technologies Used

- Vue 3 (Composition API)
- JavaScript
- CSS3
- A\* Pathfinding Algorithm

## Project Structure

- `src/components`: Vue components
- `src/utils`: Utility functions (pathfinding, map I/O, parking lot generation)
- `src/styles`: CSS stylesheets
- `src/assets`: Static assets

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- This project was inspired by the need for better parking lot design tools
- Thanks to the Vue.js team for their amazing framework
