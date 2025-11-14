# Integration Plan: Sprite Sheet Tool to Cocos Creator

## Overview

Integrate the sprite sheet packing/unpacking functionality from the main project into Cocos Creator extension.

## Current Status

### Completed
- Cocos Creator extension template created (sprite-sheet-tool/)
- Extension dependencies installed
- CLI bridge framework created (scripts/cocos-pack.ts)
- Main project core functions analyzed:
  - Pack: src/composables/useSpritePacker.ts
  - Unpack: src/composables/useSpriteUnpacker.ts
  - Parsers: src/parsers/JsonParser.ts, PlistParser.ts
  - Utils: src/utils/packAlgorithms.ts, imageUtils.ts

### TODO
- Extension build
- Extension panel UI components
- Pack functionality integration
- Unpack functionality integration
- Cocos Creator API integration (file read/write, asset refresh)
- Error handling and logging
- Testing and documentation

## Integration Strategy

### Option 1: Reuse Core Logic (Recommended)

**Advantages**:
- Code reuse, lower maintenance cost
- Consistent functionality
- Easy to sync updates

**Disadvantages**:
- Need to adapt browser API to Node.js (Canvas API)
- Need to handle file system operations

### Option 2: Re-implement in Extension

**Advantages**:
- Fully adapted to Node.js environment
- No browser API dependencies
- Better performance

**Disadvantages**:
- Code duplication, higher maintenance cost
- Potential functionality inconsistencies

## Recommended: Option 1

### Implementation Steps

1. **Install Dependencies**
   - node-canvas or sharp for Canvas API
   - fs-extra for file system operations

2. **Create Shared Module**
   - Extract core logic to shared module
   - Adapt to Node.js environment

3. **Create Extension Panel UI**
   - Pack panel component
   - Unpack panel component
   - Split panel component

4. **Integrate Cocos Creator API**
   - Read project resources
   - Write results to project
   - Refresh asset database

5. **Implement File Operations**
   - Read Cocos Creator project assets
   - Write pack results to project
   - Handle .meta files

## Technical Choices

### Canvas API Alternatives

1. **node-canvas** (Recommended)
   - Compatible with browser Canvas API
   - Good performance
   - Easy migration

2. **sharp**
   - High performance
   - Need code adaptation
   - More features

## Next Steps

1. Install node-canvas in extension project
2. Create extension panel UI components
3. Extract and adapt core logic
4. Implement Cocos Creator API integration
5. Test and document
