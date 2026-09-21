# Unit I: Fundamentals of Computer Graphics
## Chapter 1: Concepts and Applications

### Basic Concepts
- **Definition:** Computer Graphics is the art and science of generating, manipulating, storing, and displaying visual images and models using computers. It bridges mathematics (geometry, linear algebra) and human visual perception, enabling machines to communicate information visually.
- **Core Components:**
    - **Modeling:** Creating a mathematical representation of a 2D or 3D object. Includes geometry (vertices, edges, faces), topology (how surfaces connect), and attributes (color, texture, material). Examples: polygon meshes, NURBS surfaces, voxel grids.
    - **Rendering:** Converting a model into a visual image via lighting, shading, and texture mapping. Can be:
        - **Real-time** (OpenGL, DirectX — 30-120 FPS for games).
        - **Offline** (RenderMan, Arnold — hours per frame for film VFX).
    - **Animation:** Simulating movement over time through keyframing, interpolation, physics simulation, and motion capture.
    - **Interaction:** Allowing users to control and manipulate graphics in real-time via mouse, keyboard, touch, or VR controllers.
- **Coordinate Systems:**
    - **World Coordinates:** Global scene reference frame.
    - **Model Coordinates:** Local to each object before placement.
    - **Viewing Coordinates:** Camera-relative space.
    - **Device Coordinates:** Final pixel space on the display.
- **Pixel and Resolution Concepts:**
    - **Pixel (Picture Element):** The smallest addressable display unit, storing color/intensity.
    - **Resolution:** Total pixel count (e.g., 1920×1080). Higher = finer detail.
    - **Aspect Ratio:** Width-to-height ratio (e.g., 16:9). Mismatch distorts images.
    - **Color Depth:** Bits per pixel (e.g., 24-bit true color = 16.7M colors).
- **Graphics Pipeline (High Level):**
    1. **Application Stage** → 2. **Geometry Stage** (transform, clip) → 3. **Rasterization Stage** (scan convert) → 4. **Fragment Stage** (shade) → 5. **Display**
- **Reference:** [Computer Graphics Basics - GeeksforGeeks](https://www.geeksforgeeks.org/computer-graphics-basics/)
- **Reference:** [Introduction to Computer Graphics - TutorialsPoint](https://www.tutorialspoint.com/computer_graphics/computer_graphics_introduction.htm)

### Applications of Computer Graphics
- **User Interfaces:** GUI for operating systems, mobile apps, and web browsers. Icons, buttons, animations rely on real-time graphics. Modern frameworks (Flutter, React Native) use GPU-accelerated rendering.
- **Computer-Aided Design (CAD):** Engineering, architecture, automotive design. Supports parametric modeling, constraint solving, and 3D visualization. Examples: AutoCAD, SolidWorks, CATIA.
- **Scientific Visualization:** Mapping complex data into visual form:
    - Medical imaging (MRI, CT, PET) reconstructed into 3D volumes.
    - Molecular modeling (protein folding, drug discovery).
    - Weather and climate simulation maps.
    - Fluid dynamics (CFD) visualization.
- **Entertainment:** Video games, animated movies, VFX. Real-time engines (Unreal, Unity) and offline renderers (RenderMan, Arnold) drive GPU demand.
- **Cartography:** Maps, satellite imagery analysis, GIS. Includes terrain rendering, heatmaps, route visualization.
- **Education and Training:** Flight simulators, surgical simulators, virtual classrooms, AR-based learning.
- **Simulation and Training:** Military simulations, driving simulators, disaster response training.
- **Advertising and Design:** 3D product visualization, motion graphics, interactive billboards.
- **Reference:** [Applications of Computer Graphics - GeeksforGeeks](https://www.geeksforgeeks.org/applications-of-computer-graphics/)

---

## Chapter 2: Graphics Hardware and Devices

### Random Scan (Vector) Devices
- **Definition:** Draws images by directing an electron beam directly to points where lines are to be drawn. Also known as **Vector display** or **Calligraphic display**.
- **Working Principle:** The display processor maintains a **display list** (set of line drawing commands). Beam draws one line at a time, moving directly from one endpoint to the next. Refresh rate typically 30–60 Hz to avoid flicker.
- **Architecture:**
    - **Display Processing Unit (DPU):** Interprets commands from the display list.
    - **Vector Generator:** Converts line endpoints into beam movement commands.
    - **CRT:** Draws actual lines on a phosphor-coated screen.
- **Advantages:**
    - Very high resolution (sub-pixel accuracy).
    - Smooth continuous lines (no aliasing).
    - Requires less memory (stores endpoints, not pixels).
- **Disadvantages:**
    - Limited to line drawings (no solid fills or complex images).
    - Flicker if display list is too long to refresh at 30–60 Hz.
    - Expensive hardware due to precision analog components.
- **Applications:** Early CAD systems, air traffic control, military radar displays.
- **Reference:** [Random Scan vs Raster Scan - GeeksforGeeks](https://www.geeksforgeeks.org/difference-between-random-scan-and-raster-scan-display/)

### Raster Scan Devices
- **Definition:** Draws images by sweeping an electron beam across the screen row by row, top to bottom. Also known as a **Bitmap display**.
- **Working Principle:** Image stored in a **frame buffer** as a matrix of pixels. Beam intensity modulated by buffer values. Sweep is left→right, top→bottom, with horizontal and vertical retrace intervals.
- **Components:**
    - **Frame Buffer:** Memory storing pixel values (frame buffer size = width × height × bits-per-pixel).
    - **Video Controller:** Reads frame buffer, drives display.
    - **Scan Converter:** Translates geometry into pixel patterns.
- **Advantages:**
    - Solid fills, complex images, and text.
    - Lower cost than vector displays.
    - Realistic shading and textures.
- **Disadvantages:**
    - Jagged edges (aliasing) due to discrete pixels.
    - Large memory requirement.
- **Refresh Rate:** Screen redraws per second (typically 60 Hz or higher).
- **Interlaced vs Progressive Scanning:** Interlaced updates odd/even lines alternately (CRT TVs); progressive updates all lines per frame (modern displays).
- **Reference:** [Raster Scan Display - Javatpoint](https://www.javatpoint.com/computer-graphics-raster-scan-display)

### Input-Output Devices
- **CRT (Cathode Ray Tube):**
    - **Components:** Electron gun, deflection coils, phosphor-coated screen, shadow mask (for color).
    - **Working:** Electron beam hits phosphor, causing glow. Glow fades quickly, requiring constant refresh (60–85 Hz).
    - **Color CRT:** Three electron guns (R, G, B) plus a shadow mask to ensure each beam hits the correct phosphor dot.
- **LCD (Liquid Crystal Display):**
    - **Components:** Backlight, polarizing filters, liquid crystal layer, color filters, electrodes.
    - **Working:** Liquid crystals twist to block or allow light through polarizers. Voltage controls twist angle, modulating brightness.
    - **Advantages:** Thin, lightweight, low power, no flicker.
    - **Disadvantages:** Limited viewing angles, slower response (reduced with modern IPS panels).
- **Plasma Displays:** Ionized gas emits UV light that excites phosphors. Largely obsolete.
- **OLED Displays:** Organic LEDs emit light directly. No backlight needed. Excellent contrast, thin, flexible.
- **Laser Printer:**
    - **Working:** Laser beam creates a latent electrostatic image on a rotating drum. Toner is attracted to charged areas, transferred to paper, fused with heat.
    - **Resolution:** Measured in DPI (dots per inch). Common: 600, 1200 DPI.
- **Inkjet Printer:** Sprays tiny ink droplets onto paper. Better for color photos.
- **Plotters:** Vector-based printers used for large-format engineering/architectural drawings.
- **Reference:** [Display Devices in Computer Graphics - GeeksforGeeks](https://www.geeksforgeeks.org/display-devices-in-computer-graphics/)

---

## Chapter 3: Output Primitives (Line and Circle)

### Line Drawing Algorithms - DDA (Digital Differential Analyzer)
- **Type:** Incremental algorithm.
- **Logic:** Calculates intermediate points by stepping along the line based on slope (m).
- **Algorithm Steps:**
    1. Calculate `dx = x2 - x1`, `dy = y2 - y1`.
    2. Calculate `m = dy / dx`.
    3. If `|m| <= 1`: `x` increments by 1, `y` increments by `m`.
    4. If `|m| > 1`: `x` increments by `1/m`, `y` increments by 1.
    5. Plot rounded coordinates `(round(x), round(y))`.
- **Mathematical Basis:** For each step, `y = y1 + m * (x - x1)` — the point-slope form of the line.
- **Advantages:** Simple, fast, easy to implement.
- **Disadvantages:** Floating-point arithmetic (slow); accumulates rounding errors; unsuitable for hardware implementation.
- **Edge Cases:** Vertical lines (`dx = 0`) must be handled separately to avoid division by zero.
- **Reference:** [DDA Line Drawing Algorithm - GeeksforGeeks](https://www.geeksforgeeks.org/dda-line-generation-algorithm-computer-graphics/)

### Line Drawing Algorithms - Bresenham's Line Algorithm
- **Type:** Integer-based incremental algorithm.
- **Logic:** Uses a decision variable (error term) to choose the next pixel closest to the true mathematical line.
- **Algorithm Steps (for 0 < m < 1):**
    1. Calculate `dx`, `dy`, `2dy`, `2dy - 2dx`.
    2. Initial decision parameter `p0 = 2dy - dx`.
    3. For each `x` from `x1` to `x2`:
        - Plot `(x, y)`.
        - If `p < 0`: `y` unchanged, `p = p + 2dy`.
        - If `p >= 0`: `y = y + 1`, `p = p + 2dy - 2dx`.
- **Derivation Intuition:** The decision parameter represents the difference between two candidate pixels' distances from the ideal line.
- **Advantages:** Integer-only arithmetic; accurate; hardware implementable.
- **Disadvantages:** Slightly more complex than DDA.
- **Generalization:** Applies to all octants via symmetry transformations.
- **Reference:** [Bresenham's Line Algorithm - GeeksforGeeks](https://www.geeksforgeeks.org/bresenhams-line-generation-algorithm/)

### Circle Generating Algorithms - Bresenham's Circle Algorithm
- **Symmetry:** Circle is symmetric in 8 octants. Compute one octant (0°–45°) and reflect:
    - `(x, y)`, `(y, x)`, `(y, -x)`, `(x, -y)`, `(-x, -y)`, `(-y, -x)`, `(-y, x)`, `(-x, y)`.
- **Algorithm Steps:**
    1. Start at `(0, r)`.
    2. Initial decision parameter `d = 3 - 2r`.
    3. While `x <= y`:
        - Plot 8 symmetric points.
        - If `d < 0`: `d = d + 4x + 6`.
        - If `d >= 0`: `y = y - 1`, `d = d + 4(x - y) + 10`.
        - `x = x + 1`.
- **Advantages:** Integer-only arithmetic; accurate; efficient.
- **Disadvantages:** Requires a separate algorithm for ellipses.
- **Reference:** [Bresenham's Circle Drawing Algorithm - GeeksforGeeks](https://www.geeksforgeeks.org/bresenhams-circle-drawing-algorithm/)

### Circle Generating Algorithms - Midpoint Circle Algorithm
- **Logic:** Similar to Bresenham's but uses the circle equation `f(x,y) = x² + y² - r²`.
- **Decision Criterion:** Evaluate `f(x, y)` at the midpoint between two candidate pixels:
    - If `f < 0`: midpoint inside circle → choose top pixel.
    - If `f >= 0`: midpoint outside circle → choose bottom pixel.
- **Algorithm Steps:**
    1. Start at `(0, r)`.
    2. `p0 = 1 - r`.
    3. While `x <= y`:
        - Plot 8 points.
        - If `p < 0`: `p = p + 2x + 3`.
        - If `p >= 0`: `y = y - 1`, `p = p + 2(x - y) + 5`.
        - `x = x + 1`.
- **Ellipse Extension:** Replace `r²` with the ellipse equation; track two regions (Region 1: slope < 1; Region 2: slope > 1) with separate decision parameters.
- **Reference:** [Midpoint Circle Drawing Algorithm - GeeksforGeeks](https://www.geeksforgeeks.org/mid-point-circle-drawing-algorithm/)

### Other Output Primitives
- **Ellipse Drawing:** Midpoint ellipse algorithm uses the standard equation `(x²/a²) + (y²/b²) = 1`. Two-region traversal (Region 1 top, Region 2 bottom) with separate decision parameters.
- **Polynomial and Spline Curves:** Higher-order primitives built by combining Bezier or B-spline segments (covered in Unit III).
- **Filled Regions:** Solid-color or patterned rectangles, circles, and polygons, generated from scan-line or flood-fill algorithms (Chapter 5).
- **Text Rendering:** Uses bitmap or vector fonts. Bitmap fonts are grid-based; vector fonts (TrueType, OpenType) are outlines filled using scan-line algorithms.

---

## Chapter 4: Antialiasing Techniques

### Aliasing
- **Definition:** The jagged, stair-step appearance of lines, curves, or edges due to the discrete nature of pixels in a raster display. Also known as "jaggies."
- **Cause:** Finite pixel-grid resolution cannot perfectly represent a continuous mathematical line.
- **Types of Aliasing:**
    - **Spatial Aliasing:** Jagged edges along sloped lines.
    - **Temporal Aliasing:** Flickering or strobing in animations (e.g., wheel spokes appearing to rotate backward).
    - **Color Aliasing:** Moiré patterns or color banding in textures.
- **Nyquist-Shannon Sampling Theorem:** To faithfully reproduce a signal, the sampling rate must be at least twice the highest frequency in the signal. Violations cause aliasing.
- **Mathematical Example:** A line with slope 0.5 crosses pixel boundaries every 2 pixels. Without antialiasing, this produces a repeating 2-pixel staircase pattern.
- **Reference:** [Antialiasing in Computer Graphics - GeeksforGeeks](https://www.geeksforgeeks.org/antialiasing-in-computer-graphics/)

### Antialiasing Methods
- **Super Sampling (Post-filtering):**
    - **Method:** Sample the scene at much higher resolution than the display (e.g., 4×4 sub-pixels per pixel). Average the sub-pixels to determine each pixel's color.
    - **Advantage:** High quality, general-purpose.
    - **Disadvantage:** Computationally expensive — 4× cost for 2×2, 16× cost for 4×4.
    - **Formula:** `PixelColor = (1/N) * Σ SubPixelColor_i` for N sub-pixels.
- **Pixel Weighting (Area Sampling):**
    - **Method:** Weight each sub-pixel based on its distance from the pixel center. Sub-pixels near the center contribute more than those near the edge.
    - **Advantage:** Better than uniform super-sampling; reduces edge blurring.
    - **Implementation:** Use a filter kernel (e.g., Gaussian, box, tent).
- **Pixel Phasing:**
    - **Method:** Move the electron beam to a position closer to the true line path. Hardware-based technique used in vector displays.
    - **Limitation:** Only works on CRT-based systems; not applicable to flat panels.
- **Multisampling (MSAA):**
    - **Method:** Samples multiple positions per pixel but shades once. Used in real-time graphics (OpenGL, DirectX).
    - **Trade-off:** Cheaper than full super-sampling, but less effective at internal edges.
- **FXAA (Fast Approximate AA):**
    - **Method:** Post-process blur of detected edges. Very cheap; used in games.
    - **Trade-off:** Blurry textures; artifacts on high-contrast areas.
- **Temporal AA (TAA):**
    - **Method:** Accumulates samples across multiple frames using motion vectors.
    - **Trade-off:** Effective but can cause ghosting on fast motion.
- **Deep Learning AA (DLSS, FSR):**
    - **Method:** Neural network upscaling from lower resolution. Combines antialiasing with performance boost.
- **Reference:** [Anti-Aliasing Techniques - TutorialsPoint](https://www.tutorialspoint.com/computer_graphics/antialiasing.htm)

---

## Chapter 5: Area Filling Algorithms

### Boundary Fill Algorithm
- **Definition:** Fills a region by starting from a seed pixel inside the region and proceeding outward until a boundary color is encountered.
- **Algorithm Steps:**
    1. Check if current pixel is the boundary color or the fill color.
    2. If not, set pixel to fill color.
    3. Recursively call the function for the 4-connected or 8-connected neighbors.
- **4-connected vs 8-connected:**
    - **4-connected:** Considers up, down, left, right neighbors.
    - **8-connected:** Also includes diagonal neighbors. Fills faster but can leak through diagonal gaps.
- **Advantage:** Simple and intuitive.
- **Disadvantage:** Recursive implementation can cause stack overflow for large regions; use an explicit stack or queue.
- **Optimization:** Scan-line based flood fill fills an entire horizontal run per iteration, drastically reducing recursion depth.
- **Reference:** [Boundary Fill Algorithm - GeeksforGeeks](https://www.geeksforgeeks.org/boundary-fill-algorithm-in-computer-graphics/)

### Flood Fill Algorithm
- **Definition:** Fills a region by starting from a seed pixel and replacing all connected pixels of the *same* color with the new fill color.
- **Algorithm Steps:**
    1. Check if current pixel is the old color.
    2. If yes, set it to the new fill color.
    3. Recursively call for neighbors.
- **Advantage:** Works without a distinct boundary color.
- **Disadvantage:** Can flood entire image if there's a color leak.
- **Application:** Paint bucket tool in image editors.
- **Comparison with Boundary Fill:**
    - **Boundary Fill:** Stops at a specific boundary color.
    - **Flood Fill:** Replaces a specific interior color.
- **Reference:** [Flood Fill Algorithm - GeeksforGeeks](https://www.geeksforgeeks.org/flood-fill-algorithm-in-computer-graphics/)

### Scan-line Polygon Fill Algorithm
- **Definition:** An efficient algorithm for filling polygons by processing the image line by line (scan lines).
- **Algorithm Steps:**
    1. **Find Intersections:** For each scan line, find all intersections with polygon edges.
    2. **Sort Intersections:** Sort x-coordinates of intersections.
    3. **Pair Intersections:** Pair intersections (1st with 2nd, 3rd with 4th, etc.).
    4. **Fill:** Fill pixels between paired intersections.
- **Active Edge Table (AET):**
    - Maintains edges intersecting the current scan line.
    - Each entry stores: `y_max`, `x_at_ymin`, `slope_inverse (1/m)`.
    - Updated incrementally as the scan line moves down: `x_new = x_old + 1/m`.
- **Edge Table (ET):**
    - Contains all edges sorted by `y_min`.
    - Bucketed by scan line: edges enter AET when the scan line reaches their `y_min`.
- **Edge Cases:**
    - Horizontal edges are ignored (no intersection).
    - Vertices are handled by shortening one edge (using `y_max - 1` in the AET) to avoid double-counting.
- **Advantages:** Very efficient — O(edges + pixels) instead of O(pixels²).
- **Extension to Filled Regions with Holes:**
    - Use **even-odd rule** (pair intersections) or **nonzero winding rule** (count winding direction).
- **Reference:** [Scan Line Polygon Fill Algorithm - GeeksforGeeks](https://www.geeksforgeeks.org/scan-line-polygon-filling-algorithm/)

---
# Unit II: Transformation, Viewing, and Clipping
## Chapter 1: 2-D Transformation
### Basic Transformations
- **Translation:**
    - **Formula:** `x' = x + tx`, `y' = y + ty`.
    - **Description:** Moves the object by a fixed distance in a given direction.
    - **Matrix Form:** `[x', y', 1] = [x, y, 1] · [[1, 0, 0], [0, 1, 0], [tx, ty, 1]]`.
    - **Properties:** Rigid-body transform — preserves shape, size, and orientation; all points move by the same vector.
- **Scaling:**
    - **Formula:** `x' = x * sx`, `y' = y * sy`.
    - **Types:** Uniform (sx = sy) preserves proportions; Non-Uniform (sx ≠ sy) stretches or compresses along axes.
    - **Pivot Scaling:** Scaling about an arbitrary point `(px, py)` requires translate → scale → translate-back:
        - `M = T(px, py) · S(sx, sy) · T(-px, -py)`.
    - **Effect on Shape:** Objects move away from or toward the origin depending on whether `sx, sy > 1` or `< 1`.
- **Rotation:**
    - **Formula (counter-clockwise about origin):** `x' = x·cosθ − y·sinθ`, `y' = x·sinθ + y·cosθ`.
    - **Matrix:** `[[cosθ, sinθ, 0], [−sinθ, cosθ, 0], [0, 0, 1]]`.
    - **Pivot Rotation:** About an arbitrary point `(px, py)`: `M = T(px, py) · R(θ) · T(-px, -py)`.
    - **Properties:** Preserves distances and angles; clockwise rotation uses `−θ`.
- **Reflection:**
    - **X-axis:** `y' = -y` (flips vertically).
    - **Y-axis:** `x' = -x` (flips horizontally).
    - **Origin:** `x' = -x`, `y' = -y`.
    - **Line y = x:** `x' = y`, `y' = x`.
    - **Arbitrary Line:** Reflection about a line through origin at angle θ is equivalent to rotate → reflect X-axis → rotate back.
    - **Effect:** Mirror image; handedness is reversed (clockwise becomes counter-clockwise).
- **Shear:**
    - **X-Shear:** `x' = x + shx·y`, `y' = y`.
    - **Y-Shear:** `x' = x`, `y' = shy·x + y`.
    - **Matrix (X-Shear):** `[[1, 0, 0], [shx, 1, 0], [0, 0, 1]]`.
    - **Effect:** Slants the object; preserves area but not angles; used for italic fonts and oblique projections.
- **Reference:** [2D Transformation in Computer Graphics - GeeksforGeeks](https://www.geeksforgeeks.org/2d-transformation-in-computer-graphics/)

### Matrix Representation and Homogeneous Coordinates
- **Homogeneous Coordinates:**
    - A 2D point `(x, y)` is represented as `(x, y, 1)` in 3D space.
    - **Why?** Allows translation (which is an addition) to be performed as a matrix multiplication.
    - **Composition:** Every affine transform can be written as a single 3×3 matrix, so chains of transforms collapse into one matrix multiply.
    - **General Form:** `[[a, b, 0], [c, d, 0], [tx, ty, 1]]` — where `[[a,b],[c,d]]` is the linear part and `[tx, ty]` is the translation.
- **Composite Transformations:**
    - Combining multiple transformations into a single matrix by multiplying the matrices.
    - **Order Matters:** `M_total = M_translation · M_rotation · M_scaling`. Reversing order produces different results.
    - **Efficiency:** Precompute `M_total` once, then apply to every vertex of the object — O(N) vertex ops instead of O(N·k) for k transforms.
    - **Associativity:** `(A · B) · C = A · (B · C)`. Composition is associative but **not commutative**.
- **Reference:** [Homogeneous Coordinates - GeeksforGeeks](https://www.geeksforgeeks.org/homogeneous-coordinates-in-computer-graphics/)

---

## Chapter 2: Two-Dimensional Viewing

### Viewing Pipeline
- **Window:** The rectangular area in world coordinates that we want to display.
- **Viewport:** The rectangular area on the display device (screen coordinates) where the window is mapped.
- **World Coordinates → Screen Coordinates:** The transform maps world-space geometry to device-space pixels via:
    1. **Window Definition:** `(xw_min, yw_min)` to `(xw_max, yw_max)`.
    2. **Viewport Definition:** `(xv_min, yv_min)` to `(xv_max, yv_max)`.
    3. **Scaling Factors:**
        - `sx = (xv_max − xv_min) / (xw_max − xw_min)`
        - `sy = (yv_max − yv_min) / (yw_max − yw_min)`
    4. **Mapping:**
        - `xv = xv_min + (xw − xw_min) · sx`
        - `yv = yv_min + (yw − yw_min) · sy`
- **Aspect Ratio Distortion:** If `sx ≠ sy`, the image is stretched. To preserve aspect ratio, choose window and viewport with matching aspect ratios.
- **Window-to-Viewport Transformation Applications:**
    - Zooming: Shrink the window (fewer world coords) → magnify the viewport.
    - Panning: Translate the window position across world space.
    - Tiling: Map the same window to multiple viewports side by side.
- **Normalization:** Intermediate step that maps world coords to a standard `[0, 1] × [0, 1]` range before device mapping — simplifies hardware pipelines.
- **Reference:** [Window to Viewport Transformation - GeeksforGeeks](https://www.geeksforgeeks.org/window-to-viewport-transformation-in-computer-graphics/)

---

## Chapter 3: Clipping Operations

### Line Clipping - Cohen-Sutherland
- **Region Codes (Outcodes):** A 4-bit code is assigned to each endpoint of a line:
    - Bit 1 (Left): 1 if `x < xmin`.
    - Bit 2 (Right): 1 if `x > xmax`.
    - Bit 3 (Bottom): 1 if `y < ymin`.
    - Bit 4 (Top): 1 if `y > ymax`.
- **Algorithm Steps:**
    1. Compute outcodes for both endpoints.
    2. **Trivial Acceptance:** If both codes are `0000`, the line is fully inside — accept.
    3. **Trivial Rejection:** If the bitwise AND of the codes is not `0000`, the line is completely outside — reject.
    4. **Clipping:** Otherwise the line intersects a boundary. Find the intersection with a boundary edge, replace the outside endpoint with the intersection, and repeat.
- **Intersection Formulas:**
    - With left edge: `y = y1 + m·(xmin − x1)`, where `m = (y2 − y1)/(x2 − x1)`.
    - With right edge: `y = y1 + m·(xmax − x1)`.
    - With top/bottom edges: `x = x1 + (y_edge − y1)/m`.
- **Advantages:** Fast trivial accept/reject on most lines; simple to implement.
- **Disadvantages:** Inefficient for lines that intersect many boundaries; repeated intersection computation.
- **Reference:** [Cohen-Sutherland Line Clipping Algorithm - GeeksforGeeks](https://www.geeksforgeeks.org/line-clipping-set-1-cohen-sutherland-algorithm/)

### Line Clipping - Liang-Barsky
- **Logic:** Uses parametric equations of the line: `x = x1 + u·dx`, `y = y1 + u·dy`.
- **Parametric Form:** For each edge, derive `p` and `q` values such that the inside condition is `p·u ≤ q`.
- **Inequality Setup (for each boundary):**
    - Left: `p = -dx`, `q = x1 - xmin`.
    - Right: `p = dx`, `q = xmax - x1`.
    - Bottom: `p = -dy`, `q = y1 - ymin`.
    - Top: `p = dy`, `q = ymax - y1`.
- **Algorithm Steps:**
    1. Calculate `dx`, `dy`.
    2. Initialize `u1 = 0`, `u2 = 1`.
    3. For each boundary: compute `p`, `q`.
        - If `p == 0` and `q < 0`: line is parallel and outside → reject.
        - If `p < 0`: `u1 = max(u1, q/p)`.
        - If `p > 0`: `u2 = min(u2, q/p)`.
    4. If `u1 > u2`: reject.
    5. Else the clipped line goes from `u1` to `u2` on the original segment.
- **Advantages:** More efficient than Cohen-Sutherland; each intersection calculation reduces the parameter range, so fewer total computations.
- **Disadvantages:** Slightly more math to set up per line.
- **Reference:** [Liang-Barsky Line Clipping Algorithm - GeeksforGeeks](https://www.geeksforgeeks.org/line-clipping-set-2-liang-barsky/)

### Polygon Clipping - Sutherland-Hodgman
- **Logic:** Clips a polygon against each window edge sequentially, one boundary at a time.
- **Algorithm Steps:**
    1. Start with the input list of polygon vertices.
    2. For each window edge (Left, Right, Bottom, Top): Create a new output list.
        - For each polygon edge `S → P`:
            - `S` inside, `P` inside → output `P`.
            - `S` inside, `P` outside → output intersection point.
            - `S` outside, `P` inside → output intersection point + `P`.
            - `S` outside, `P` outside → output nothing.
    3. Pass the output list to the next window edge.
    4. The final list is the clipped polygon.
- **Inside/Outside Test:** Based on which side of the window edge the point lies (e.g., for the left edge, inside means `x ≥ xmin`).
- **Disadvantages:** Can produce multiple disconnected polygons (or degenerate edges) when clipping concave polygons — this happens because clipping one concave shape against a rectangle can split it into pieces.
- **Extensions:** For convex polygons, output is always a single convex polygon; used widely in hardware pipelines.
- **Reference:** [Sutherland-Hodgman Polygon Clipping Algorithm - GeeksforGeeks](https://www.geeksforgeeks.org/polygon-clipping-sutherland-hodgman-algorithm/)

### Polygon Clipping - Weiler-Atherton
- **Logic:** Handles concave polygons and produces multiple polygons correctly, unlike Sutherland-Hodgman.
- **Algorithm Steps:**
    1. Create two linked lists: one for polygon vertices, one for window (clipping) vertices.
    2. Find all intersection points between polygon and window edges.
    3. Insert each intersection into both lists (in correct traversal order).
    4. Traverse the polygon boundary. On hitting an intersection, switch to the window boundary (or vice versa based on entry/exit direction).
    5. Continue until returning to the start point.
    6. Repeat for unvisited intersections to find additional output polygons.
- **Entry vs Exit:** Entry intersections have the polygon entering the window; exit intersections have it leaving. Switch directions only at the correct type.
- **Advantages:** Correctly handles concave polygons, self-intersecting polygons, and multiple disjoint output regions.
- **Disadvantages:** More complex implementation; requires careful handling of coincident edges and vertex-on-boundary cases.
- **Applications:** CAD, GIS, and any system that clips complex shapes against rectangular or polygonal windows.
- **Reference:** [Weiler-Atherton Polygon Clipping Algorithm - GeeksforGeeks](https://www.geeksforgeeks.org/weiler-atherton-polygon-clipping-algorithm/)

---
# Unit III: 3D Transformation, Visible Surface Detection, and Curves

## Chapter 1: Visible Surface Detection Algorithms

### Object-Space vs. Image-Space Methods
- **Object-based (Object-space):**
    - Compares objects in the scene to determine visibility.
    - Works in continuous **world coordinates**, before rasterization.
    - Complexity scales with the number of objects (`n`), typically O(n²) for pairwise comparisons.
    - Examples: Back-face removal, Painter's Algorithm, BSP trees.
    - **Advantages:** High precision (no pixel quantization); good for scenes with many pixels per polygon.
    - **Disadvantages:** Expensive for large polygon counts; poor for overlapping geometry.
- **Image-based (Image-space):**
    - Works at the **pixel level** on the projection plane (after rasterization).
    - Determines which object is visible at each pixel via depth comparisons.
    - Complexity scales with the number of pixels (`p`) × number of objects (`n`).
    - Examples: Z-Buffer, Scan-line, Warnock's Algorithm.
    - **Advantages:** Simple; handles intersecting geometry naturally.
    - **Disadvantages:** Limited by screen resolution; requires large frame/depth buffers.
- **Hybrid Approaches:** Modern GPUs use a mix — back-face culling (object-space) followed by Z-buffer (image-space).
- **Reference:** [Visible Surface Detection - GeeksforGeeks](https://www.geeksforgeeks.org/visible-surface-detection-in-computer-graphics/)

### Depth Comparison (Z-Buffer)
- **Type:** Image-space method.
- **Data Structures:**
    - **Frame Buffer:** Stores the color of each pixel.
    - **Depth Buffer (Z-Buffer):** Stores the depth (z-value) of the closest object at each pixel.
    - Both are the same dimensions as the screen (e.g., 1920×1080).
- **Algorithm Steps:**
    1. Initialize all depth buffer values to infinity (or maximum depth).
    2. For each polygon, for each pixel inside its projection:
        - Compute the depth `z` of the polygon at that pixel (interpolated from vertex depths).
        - If `z < depth_buffer[x][y]`:
            - `depth_buffer[x][y] = z`.
            - `frame_buffer[x][y] = color`.
- **Depth Interpolation (Incremental):**
    - For a polygon with plane equation `ax + by + cz + d = 0`: `z = -(ax + by + d) / c`.
    - Incremental update across scan lines: `z_next = z + Δz` where `Δz = -a/c` per x-step.
- **Advantages:** Simple, works for any object shape, handles intersecting objects, O(n·p) complexity.
- **Disadvantages:** Requires large memory (depth buffer + frame buffer); cannot handle transparency directly; z-precision issues at distance.
- **Z-Fighting:** When two polygons have nearly identical depth values, the renderer flickers between them. Mitigation: logarithmic depth buffer, polygon offset.
- **Reference:** [Z-Buffer Algorithm - GeeksforGeeks](https://www.geeksforgeeks.org/z-buffer-depth-buffer-method/)

### A-Buffer
- **Definition:** An extension of the Z-buffer that handles transparency and anti-aliasing.
- **Logic:** Instead of storing only the closest fragment, stores a **linked list of fragments** per pixel, each with:
    - Color (RGBA), depth, opacity, coverage (fraction of pixel covered).
- **Algorithm Steps:**
    1. For each polygon, rasterize into fragments.
    2. Insert each fragment into the A-buffer list for its pixel, sorted by depth.
    3. At display time, composite fragments front-to-back using the alpha-blending equation:
        - `C_final = C_1 · α_1 + (1−α_1)·(C_2 · α_2 + (1−α_2)·(...))`.
- **Advantages:** Handles transparency, anti-aliasing, and complex intersections.
- **Disadvantages:** Very high memory requirement; list management overhead; rarely implemented in hardware (used in offline rendering).
- **Reference:** [A-Buffer Method - GeeksforGeeks](https://www.geeksforgeeks.org/a-buffer-method/)

### Back Face Removal
- **Definition:** Culling polygons that face away from the camera. Also called **back-face culling**.
- **Logic:**
    - For a **convex** object, a face is back-facing if its outward normal points away from the viewer.
    - Compute the dot product of the outward surface normal `N` and the view vector `V` (from surface to eye).
    - If `N · V > 0`: face points away → cull.
    - If `N · V < 0`: face points toward viewer → keep.
- **Efficient Test (for planar polygons):**
    - Given vertex order (CCW when facing viewer), compute the signed area of the projection. Negative area → back-facing.
    - Using the polygon's plane equation `ax + by + cz + d = 0`:
        - If viewer is at origin: back-facing when `d > 0` (for a specific sign convention).
- **Advantages:** Removes ~50% of polygons for closed objects, halving rendering cost.
- **Disadvantages:** Only works for closed objects with clearly defined normals; does not handle internal overlaps.
- **Applications:** Real-time rendering, CAD, game engines (built into GPU pipelines).
- **Reference:** [Back Face Removal Algorithm - GeeksforGeeks](https://www.geeksforgeeks.org/back-face-removal-algorithm-in-computer-graphics/)

### Scan-line Method
- **Type:** Image-space method.
- **Logic:** Processes the image line by line (scan lines).
- **Algorithm Steps:**
    1. Maintain an **Active Edge Table (AET)** for the current scan line.
        - Each entry: `(y_max, x_at_ymin, 1/m, polygon_id, depth_at_ymin)`.
    2. Maintain an **Edge Table (ET)** bucketed by `y_min`.
    3. For each scan line:
        - Add new edges from ET to AET (where `y_min == current y`).
        - Remove edges from AET where `y_max == current y`.
        - Compute x-intersections.
        - Sort intersections by x.
        - For each pair of intersections (left, right), determine visible surface using depth sorting.
        - Fill the span between intersections with the visible polygon's color.
    4. Incrementally update AET x-values: `x_new = x_old + 1/m`.
- **Advantages:** Efficient for scenes with many polygons; processes one scan line at a time (low memory).
- **Disadvantages:** Complex implementation (edge tables, sorting); poor for scenes with many small polygons crossing scan lines.
- **Reference:** [Scan Line Algorithm for Visible Surface Detection - GeeksforGeeks](https://www.geeksforgeeks.org/scan-line-algorithm-for-visible-surface-detection/)

### Depth Sorting Method (Painter's Algorithm)
- **Type:** Object-space method.
- **Logic:** Sort polygons by depth (furthest to closest), then paint them in that order — nearer polygons overwrite distant ones.
- **Sorting Key:** Use the maximum z-value (or minimum, depending on coordinate convention) of each polygon.
- **Algorithm Steps:**
    1. Sort all polygons by depth.
    2. Paint the furthest polygon first.
    3. Continue painting until all polygons are drawn.
- **Handling Cyclic Overlaps:**
    - If polygon A overlaps B, B overlaps C, and C overlaps A (cyclic), simple sorting fails.
    - Solution: Split one polygon into two, or use a more robust algorithm.
- **Handling Intersecting Polygons:**
    - Two polygons intersecting each other cannot be sorted by depth alone.
    - Solution: Split polygons along the intersection line.
- **Advantages:** Simple, fast for non-overlapping scenes; works well with painterly effects.
- **Disadvantages:** Fails on cyclic overlaps and intersecting polygons; not robust for real-time.
- **Reference:** [Painter's Algorithm - GeeksforGeeks](https://www.geeksforgeeks.org/painters-algorithm-in-computer-graphics/)

### Area Subdivision Method (Warnock's Algorithm)
- **Type:** Image-space method.
- **Logic:** Recursively subdivides the view plane into smaller rectangles until a decision can be made about visibility.
- **Algorithm Steps:**
    1. If the area is empty (no polygon overlaps it): fill with background.
    2. If the area is entirely inside one polygon: fill with that polygon's color.
    3. If the area is entirely outside all polygons: fill with background.
    4. If the area is complex (intersects multiple polygons): subdivide into 4 quadrants and recurse.
- **Recursion Termination:** Subdivision stops when the rectangle is smaller than a pixel or when a simple decision can be made.
- **Complexity:** O(p·w·h) worst case, where `p` = polygons, `w`, `h` = dimensions. Average case much better for typical scenes.
- **Advantages:** Simple, handles complex scenes, no sorting needed.
- **Disadvantages:** Recursive overhead; can be slow for high-resolution images with many small polygons.
- **Variants:** Binary space partitioning (BSP) trees are a spatial-generalization of the same idea.
- **Reference:** [Warnock's Algorithm - GeeksforGeeks](https://www.geeksforgeeks.org/warnocks-algorithm-in-computer-graphics/)

---

## Chapter 2: 3-D Transformation

### 3D Transformations
- **Translation:**
    - `(x, y, z)` → `(x+tx, y+ty, z+tz)`.
    - Matrix (homogeneous 4×4): `[[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [tx, ty, tz, 1]]`.
- **Scaling:**
    - `(x, y, z)` → `(x*sx, y*sy, z*sz)`.
    - Matrix: `[[sx, 0, 0, 0], [0, sy, 0, 0], [0, 0, sz, 0], [0, 0, 0, 1]]`.
    - **Pivot Scaling:** About `(px, py, pz)` requires translate → scale → translate-back.
- **Rotation (about coordinate axes, counter-clockwise):**
    - **X-axis:** `y' = y·cosθ − z·sinθ`, `z' = y·sinθ + z·cosθ`. Matrix: `[[1,0,0,0], [0,cosθ,sinθ,0], [0,−sinθ,cosθ,0], [0,0,0,1]]`.
    - **Y-axis:** `x' = x·cosθ + z·sinθ`, `z' = −x·sinθ + z·cosθ`. Matrix: `[[cosθ,0,−sinθ,0], [0,1,0,0], [sinθ,0,cosθ,0], [0,0,0,1]]`.
    - **Z-axis:** `x' = x·cosθ − y·sinθ`, `y' = x·sinθ + y·cosθ`. Matrix: `[[cosθ,sinθ,0,0], [−sinθ,cosθ,0,0], [0,0,1,0], [0,0,0,1]]`.
    - **Arbitrary Axis Rotation:** Decompose into a sequence of rotations about axes to align with the target axis, rotate, then rotate back.
- **Reflection:** Across planes (XY, YZ, XZ).
    - **XY-plane:** `z' = -z`. Matrix: `[[1,0,0,0], [0,1,0,0], [0,0,−1,0], [0,0,0,1]]`.
    - **YZ-plane:** `x' = -x`.
    - **XZ-plane:** `y' = -y`.
- **Shear (3D):** Six variants (XY-shear, XZ-shear, YX-shear, YZ-shear, ZX-shear, ZY-shear). Example XY-shear: `x' = x + shx·y`, `y' = y + shy·x`, `z' = z`.
- **Composite Transformations:** All 3D transforms can be combined into a single 4×4 matrix; applied to homogeneous coordinates `(x, y, z, 1)`.
- **Reference:** [3D Transformation in Computer Graphics - GeeksforGeeks](https://www.geeksforgeeks.org/3d-transformation-in-computer-graphics/)

### 3-D Viewing Projections
- **Parallel Projection:**
    - Projectors are parallel.
    - Preserves relative proportions — parallel lines remain parallel.
    - **Orthographic:** Projectors perpendicular to view plane. Used in engineering drawings (front/top/side views).
    - **Oblique:** Projectors at an angle to view plane.
        - **Cavalier:** Foreshortening factor = 1 (no shortening of receding edges). Angle typically 45°.
        - **Cabinet:** Foreshortening factor = 0.5 (receding edges halved). More realistic.
- **Perspective Projection:**
    - Projectors converge at a **center of projection** (eye).
    - Produces realistic depth but does not preserve proportions — parallel lines converge.
    - **Vanishing Points:** Parallel lines converge at a vanishing point. Number of vanishing points determines 1-point, 2-point, or 3-point perspective.
    - **Perspective Division:** After projection, divide `(x, y, z)` by `w` (homogeneous coordinate).
    - **Distance Distortion:** Farther objects appear smaller; angle of view matters (fov).
- **Comparison:**
    - **Parallel:** Preserves measurement; no depth cue; CAD-friendly.
    - **Perspective:** Realistic; less useful for engineering; harder to measure angles.
- **Reference:** [3D Viewing Projections - GeeksforGeeks](https://www.geeksforgeeks.org/projections-in-computer-graphics/)

### 3D Object Representations
- **Boundary Representations (B-reps):**
    - Describes objects by their surfaces (e.g., polygons, splines, NURBS).
    - Data structure: Vertices → Edges → Faces → Object.
    - Examples: STL, OBJ, PLY file formats.
    - **Advantages:** Compact; easy to render.
    - **Disadvantages:** Ambiguity (two objects can have the same boundary); poor for CSG operations.
- **Spatial Partitioning:**
    - Divides space into regions (cells) and marks each as inside, outside, or on the boundary.
    - **Octrees:** Recursively subdivide space into 8 cubes. Simple; used in volume rendering and collision detection.
    - **BSP Trees (Binary Space Partitioning):** Recursively split space with planes. Excellent for visible-surface detection (Painter's algorithm on steroids).
    - **Advantages:** Handles complex geometry; good for ray tracing.
    - **Disadvantages:** High memory; expensive to build.
- **Constructive Solid Geometry (CSG):**
    - Combines simple primitives (cubes, spheres, cylinders) using boolean operations:
        - **Union:** A ∪ B — everything inside A or B.
        - **Intersection:** A ∩ B — everything inside both.
        - **Difference:** A − B — everything inside A but not B.
    - Represented as a binary tree (CSG tree).
    - **Advantages:** Compact; natural for mechanical CAD.
    - **Disadvantages:** Rendering requires boundary evaluation (converting CSG tree to B-rep).
- **Voxel Representation:** 3D grid of unit cubes (voxels). Simple; used in medical imaging (CT, MRI).
- **Parametric Representation:** Objects defined by parametric equations (`x(t), y(t), z(t)`). Natural for splines and swept surfaces.
- **Reference:** [3D Object Representation - GeeksforGeeks](https://www.geeksforgeeks.org/3d-object-representation-in-computer-graphics/)

---

## Chapter 3: Curved Lines and Surfaces

### Spline Representations
- **Interpolating Curves:** Curve passes through all control points. Example: cubic interpolation. Good for preserving key data points.
- **Approximating Curves:** Curve is pulled towards but does not necessarily pass through control points (except endpoints). Example: Bezier, B-spline. Good for smoothness.
- **Control Points:** Define the shape of the curve. The curve "follows" the control polygon.
- **Degree:** Highest power in the polynomial representation. Higher degree = more flexibility but more computation.
- **Knot Vector:** Sequence of parameter values where curve segments join. Determines local support in B-splines.
- **Continuity Conditions:**
    - **C0 (Position):** Endpoints meet. Curve has no gaps.
    - **C1 (Tangent):** Slopes match at the join. No sharp corners.
    - **C2 (Curvature):** Rates of change of slopes match. Smooth curvature — no visible change in bending.
    - **G1, G2 (Geometric):** Tangent and curvature directions match without magnitude — used in design where exact derivatives are less important.
- **Reference:** [Spline Curves in Computer Graphics - GeeksforGeeks](https://www.geeksforgeeks.org/spline-curves-in-computer-graphics/)

### Bezier Curves
- **Concept:** Defined by a set of control points. The curve starts at the first point and ends at the last.
- **Characteristics:**
    - **Convex Hull Property:** Curve lies within the convex hull of control points.
    - Uses **Bernstein polynomials** as basis functions: `B_{i,n}(t) = C(n, i) · t^i · (1−t)^{n−i}`.
    - **Degree of Curve:** `(number of control points − 1)`. So 4 control points → cubic Bezier.
    - **Endpoint Interpolation:** `P(0) = P_0`, `P(1) = P_n`.
    - **Tangent at Endpoints:** Tangent at `P_0` is along `P_1 − P_0`; tangent at `P_n` is along `P_n − P_{n−1}`.
- **Formula:** `P(t) = Σ_{i=0}^{n} P_i · B_{i,n}(t)` for `t ∈ [0, 1]`.
- **De Casteljau's Algorithm:** Numerically stable method for evaluating Bezier curves via repeated linear interpolation.
- **Subdivision:** Any Bezier curve can be split into two Bezier curves at parameter `t = 0.5` — used in rendering and clipping.
- **Advantages:** Easy to implement; intuitive control; smooth; endpoints interpolated.
- **Disadvantages:** No local control — moving one control point affects the entire curve. Raising the degree for more complexity also makes the curve harder to control.
- **Reference:** [Bezier Curves - GeeksforGeeks](https://www.geeksforgeeks.org/bezier-curves-in-computer-graphics/)

### B-Spline Curves
- **Concept:** Generalization of Bezier curves. Instead of one global polynomial, the curve is a **piecewise** polynomial with local support.
- **Characteristics:**
    - **Local Control:** Moving a control point only affects a local portion of the curve (typically `k` segments where `k` = degree).
    - Defined by:
        - Control points `P_0, P_1, ..., P_n`.
        - Knot vector `T = [t_0, t_1, ..., t_{n+k}]`.
        - Degree `k`.
    - **Uniform B-Splines:** Knots equally spaced. Simple.
    - **Non-Uniform B-Splines:** Arbitrary knot spacing. More flexible.
    - **NURBS (Non-Uniform Rational B-Splines):** B-splines with weights — can represent conic sections (circles, ellipses) exactly. Industry standard in CAD.
- **Formula:** `P(t) = Σ_{i=0}^{n} P_i · N_{i,k}(t)` where `N_{i,k}(t)` is the B-spline basis function defined recursively (Cox-de Boor recursion).
- **Relationship to Bezier:**
    - Bezier is a special case of B-spline where the knot vector is such that each basis function has global support.
    - B-spline control points are not interpolated (except at endpoints if knots are repeated `k+1` times).
- **Advantages:** Local control; smooth continuity; flexible; represent complex shapes efficiently.
- **Disadvantages:** More complex to implement; knot vector design requires expertise; NURBS have heavier computation.
- **Reference:** [B-Spline Curves - GeeksforGeeks](https://www.geeksforgeeks.org/b-spline-curves-in-computer-graphics/)

### Bezier vs B-Spline: Comparison

| Feature | Bezier | B-Spline |
|---------|--------|----------|
| **Control** | Global (moving one point affects all) | Local (affects only nearby segments) |
| **Degree** | = number of control points − 1 | Independent of number of control points |
| **Continuity** | C^{n−1} at endpoints only | C^{k−2} at knots (adjustable) |
| **Endpoint Interpolation** | Yes (both endpoints) | Yes (if knots repeated) |
| **Complexity** | Simpler | More complex |
| **Use Case** | Design, animation curves | CAD, NURBS surfaces, complex geometry |

### Bezier vs B-Spline: Comparison

| Feature | Bezier | B-Spline |
|---------|--------|----------|
| **Control** | Global (moving one point affects all) | Local (affects only nearby segments) |
| **Degree** | = number of control points − 1 | Independent of number of control points |
| **Continuity** | C^{n−1} at endpoints only | C^{k−2} at knots (adjustable) |
| **Endpoint Interpolation** | Yes (both endpoints) | Yes (if knots repeated) |
| **Complexity** | Simpler | More complex |
| **Use Case** | Design, animation curves | CAD, NURBS surfaces, complex geometry |

### Bezier vs B-Spline: Comparison

| Feature | Bezier | B-Spline |
|---------|--------|----------|
| **Control** | Global (moving one point affects all) | Local (affects only nearby segments) |
| **Degree** | = number of control points − 1 | Independent of number of control points |
| **Continuity** | C^{n−1} at endpoints only | C^{k−2} at knots (adjustable) |
| **Endpoint Interpolation** | Yes (both endpoints) | Yes (if knots repeated) |
| **Complexity** | Simpler | More complex |
| **Use Case** | Design, animation curves | CAD, NURBS surfaces, complex geometry |

### Surface Representations
- **Bezier Surface:** Tensor product of two Bezier curves: `P(u, v) = Σ Σ P_{ij} · B_{i,m}(u) · B_{j,n}(v)`.
- **B-Spline Surface:** Tensor product of two B-splines. Control net of points, two knot vectors.
- **NURBS Surface:** Adds weights to B-spline surfaces. Standard in CAD (AutoCAD, SolidWorks, Rhino).
- **Subdivision Surfaces:** Recursive refinement of a control mesh using rules (Catmull-Clark, Loop). Used in animation and game modeling (Pixar's "SubD" workflow).

---
# Unit IV: Introduction to Image Processing

## Chapter 1: Fundamentals of Image Processing

### Basics and Applications
- **Definition:** Digital Image Processing (DIP) is the manipulation of digital images by means of a digital computer. An image is treated as a 2D function `f(x, y)` where `x, y` are spatial coordinates and `f` is the intensity or color at that point.
- **Origin:** Evolved from digital signal processing (DSP) and military/medical imaging needs (satellite reconnaissance, CT scans, radar).
- **Types of Images:**
    - **Binary:** 1 bit per pixel (0 or 1). Used for masks and silhouettes.
    - **Grayscale:** 8 bits per pixel (0–255). Most common for analysis.
    - **Color:** 24 bits per pixel (8 bits each for R, G, B) or 32 bits with alpha.
- **Applications:**
    - **Medical Imaging:** MRI, CT, PET — tumor detection, diagnosis, surgical planning.
    - **Remote Sensing:** Satellite imagery for agriculture, forestry, urban planning.
    - **Surveillance:** Face recognition, motion detection, license plate reading.
    - **Robotics:** Vision-guided navigation, object manipulation.
    - **Image Restoration:** Removing noise, blur, or compression artifacts from old photos.
    - **Industrial Inspection:** Defect detection on assembly lines.
    - **Document Processing:** OCR, handwriting recognition.
- **Components of a DIP System:**
    1. **Image Acquisition:** Sensors (CCD, CMOS), scanners, cameras.
    2. **Storage:** Hard disk, RAM, cloud (some systems need terabytes for satellite/movie data).
    3. **Processing:** CPU/GPU — GPUs are essential for parallel pixel operations.
    4. **Communication:** Networks for transmitting images between sites.
    5. **Display:** Monitors, printers — calibrated for accurate color reproduction.
- **Image Categories by Source:**
    - **Visible Light Images:** Cameras, microscopes.
    - **X-ray / Gamma-ray Images:** Medical, industrial.
    - **UV / IR Images:** Astronomy, thermal imaging.
    - **Radar / Sonar:** Remote sensing, underwater.
    - **Synthetic Images:** Computer-generated.
- **Reference:** [Fundamentals of Image Processing - GeeksforGeeks](https://www.geeksforgeeks.org/fundamentals-of-image-processing/)

### Image Formation and Resolution
- **Image Formation Model (Optical):**
    - **Scene:** Light reflects off an object.
    - **Lens:** Focuses light onto a sensor plane.
    - **Sensor:** Converts photons into electrical signals (CCD/CMOS).
    - **Digitizer:** Samples and quantizes the electrical signal into pixels.
    - **Model:** `f(x, y) = i(x, y) · r(x, y)` where `i` = illumination (0 to ∞), `r` = reflectance (0 to 1). Thus `0 ≤ f(x, y) ≤ ∞`.
- **Spatial Resolution:**
    - Number of pixels per unit area (e.g., DPI — dots per inch).
    - **Higher resolution** → more detail, larger file.
    - **Sampling Rate:** Determines how finely the continuous scene is sampled (Nyquist theorem — sample at ≥ 2× the highest spatial frequency).
- **Gray Level Resolution:**
    - Number of bits used to represent intensity.
    - 8-bit = 256 levels (most common).
    - 1-bit = 2 levels (binary).
    - 12-bit = 4096 levels (medical imaging, HDR).
- **Quantization:** Converting continuous intensity values to discrete levels. Introduces quantization error (also called quantization noise).
- **Bit Depth vs Quality:**
    - Increasing bit depth reduces quantization error but increases storage.
    - Increasing spatial resolution reduces blur but increases storage quadratically.
- **Common Resolutions:**
    - 72 DPI (screen), 300 DPI (print), 1200 DPI (scanner), 2400 DPI+ (professional scanning).
- **Aliasing in Images:** Similar to graphics — spatial aliasing causes moiré patterns in downsampled images. Anti-aliasing uses a low-pass filter before sampling.
- **Reference:** [Image Formation and Resolution - TutorialsPoint](https://www.tutorialspoint.com/dip/image_formation.htm)

---

## Chapter 2: Image Enhancement in Spatial Domain

### Basic Techniques
- **Spatial Domain vs Frequency Domain:**
    - **Spatial domain:** Direct manipulation of pixel values via transforms or filters.
    - **Frequency domain:** Manipulate the Fourier transform of the image.
- **Piecewise Transformation Functions:**
    - **Identity:** `s = r`. No change.
    - **Negative:** `s = L - 1 - r`. Inverts colors — useful for enhancing white/gray detail in dark regions (mammograms).
    - **Log Transformation:** `s = c · log(1 + r)`. Expands dark pixels, compresses bright ones. Used for dynamic range compression.
    - **Inverse Log:** `s = c · exp(r)`. Opposite effect — compresses darks, expands brights.
    - **Power-Law (Gamma):** `s = c · r^γ`.
        - `γ < 1`: Expands dark values, compresses bright (brightens).
        - `γ > 1`: Expands bright values, compresses dark (darkens).
        - Used for gamma correction to match monitor/TV response.
    - **Contrast Stretching:** Linear expansion of a narrow range to full range `[0, L-1]`.
    - **Thresholding:** `s = 0` if `r < T`, else `s = L-1`. Binary output.
- **Histogram Equalization:**
    - Transforms the image so that the histogram is approximately uniform.
    - Increases global contrast, especially for images with narrow histogram peaks.
    - **Formula:** `s_k = T(r_k) = (L-1) · Σ_{j=0}^{k} (n_j / n)` for `k = 0, ..., L-1`.
        - `n_j` = number of pixels with intensity `j`.
        - `n` = total number of pixels.
    - **Cumulative Distribution Function (CDF):** The equalization transform is essentially the CDF of the input image, scaled to `[0, L-1]`.
    - **Limitation:** Can over-enhance noise in nearly uniform regions.
- **Histogram Specification (Matching):**
    - Transforms the image so that its histogram matches a target (specified) histogram.
    - More flexible than equalization — sometimes you want a specific distribution.
    - **Algorithm:**
        1. Compute CDF of the input, `s = T(r)`.
        2. Compute CDF of the target, `v = G(z)`.
        3. Find the inverse `z = G^{-1}(s)`.
        4. Map input pixels using `z = G^{-1}(T(r))`.
- **Image Averaging:**
    - Reduces random (zero-mean) noise by averaging multiple images of the same scene.
    - **Formula:** `g(x, y) = (1/K) · Σ_{i=1}^{K} g_i(x, y)`.
    - **Noise Reduction:** Variance reduces by a factor of `K` (standard deviation by `√K`).
    - **Requirement:** All images must be aligned and the scene must be static.
- **Image Subtraction:** `g(x, y) = f_1(x, y) − f_2(x, y)`. Used in medical imaging (mask mode radiography), motion detection.
- **Image Multiplication / Division:** Used for shading correction and calibration.
- **Reference:** [Image Enhancement in Spatial Domain - GeeksforGeeks](https://www.geeksforgeeks.org/image-enhancement-in-spatial-domain/)

### Spatial Filters
- **Mechanism:** A spatial filter operates by moving a kernel (mask, window) over the image and computing a weighted sum of the neighborhood.
- **Correlation vs Convolution:**
    - **Correlation:** Sliding dot product (no kernel rotation).
    - **Convolution:** Kernel is flipped before sliding. This is the standard in signal processing.
- **Filter Kernel Size:** Typically 3×3, 5×5, or larger for stronger effects. Larger kernels = more blur/stronger filtering.
- **Border Handling:** Zero-padding, replicate, mirror, or wrap. Choice affects edge artifacts.
- **Smoothing Filters (Low Pass):**
    - **Averaging Filter:** Simple box kernel where all weights are equal. `K = (1/9) · [[1,1,1],[1,1,1],[1,1,1]]`. Removes noise but blurs edges.
    - **Gaussian Filter:** Weighted by a Gaussian kernel. Better edge preservation than averaging. Kernel weight: `G(x, y) = (1/(2πσ²)) · exp(-(x² + y²) / (2σ²))`.
    - **Median Filter:** Replaces each pixel with the median of its neighborhood. Excellent for **salt-and-pepper noise** — preserves edges.
    - **Bilateral Filter:** Preserves edges while smoothing, by weighting neighbors by both spatial distance and intensity difference.
- **Sharpening Filters (High Pass):**
    - **Laplacian:** Second derivative operator. Kernel: `[[0,1,0],[1,-4,1],[0,1,0]]` (4-neighbor) or `[[1,1,1],[1,-8,1],[1,1,1]]` (8-neighbor). Enhances edges.
    - **Sobel:** First derivative — detects gradients in x and y directions.
        - `Gx = [[-1,0,1],[-2,0,2],[-1,0,1]]`, `Gy = [[-1,-2,-1],[0,0,0],[1,2,1]]`.
        - Magnitude: `|G| = √(Gx² + Gy²)`.
    - **Prewitt:** Similar to Sobel with equal weights.
    - **Unsharp Masking:** `sharpened = original + k · (original − blurred)`. Subtracting a blurred version from the original to enhance edges.
    - **High-Boost Filtering:** Generalization of unsharp masking with `A > 1`: `sharpened = A · original − blurred`.
- **Frequency Response:**
    - Low-pass: passes low frequencies, blocks high.
    - High-pass: passes high frequencies (edges), blocks low.
    - Band-pass: passes a mid-range of frequencies.
- **Reference:** [Spatial Filtering in Image Processing - GeeksforGeeks](https://www.geeksforgeeks.org/spatial-filtering-in-image-processing/)

### Sampling and Quantization
- **Sampling:** Digitizing the spatial coordinates `(x, y)`. Determines the spatial resolution.
    - **Nyquist Rate:** Sampling frequency must be ≥ 2× the highest frequency in the signal to avoid aliasing.
    - **Undersampling:** Results in aliasing — moiré patterns, false detail.
    - **Downsampling:** Reducing resolution after applying an anti-aliasing filter.
    - **Upsampling:** Increasing resolution via interpolation (nearest, bilinear, bicubic).
- **Quantization:** Digitizing the amplitude (intensity). Determines the gray-level resolution.
    - **Uniform Quantization:** Equal step sizes (most common).
    - **Non-uniform Quantization:** Smaller steps where intensity changes are subtle (e.g., human vision is more sensitive to dark tones — use more levels there).
    - **Quantization Error:** Difference between the true value and the quantized value. Bounded by ±0.5 step size.
- **Trade-offs:**
    - Higher sampling: more spatial detail, larger files.
    - Higher quantization: better intensity fidelity, larger files.
    - Typical choice: 8 bits per pixel with adaptive sampling.
- **Relationships between Pixels:**
    - **4-Neighbors (N4):** `(x±1, y)` and `(x, y±1)`. Immediate up/down/left/right.
    - **Diagonal Neighbors (ND):** `(x±1, y±1)`. Four diagonals.
    - **8-Neighbors (N8):** Union of N4 and ND. All 8 surrounding pixels.
    - **Adjacency:**
        - **4-adjacency:** Two pixels are 4-adjacent if they are 4-neighbors and have the same value.
        - **8-adjacency:** Two pixels are 8-adjacent if they are 8-neighbors and have the same value.
        - **m-adjacency (Mixed):** 8-adjacency, but two pixels are m-adjacent if one is a 4-neighbor of the other, OR if one is a diagonal neighbor and neither shares a 4-neighbor with the other that has the same value. Eliminates ambiguity in binary images.
    - **Path and Connectivity:** A path is a sequence of pixels where consecutive pixels are adjacent. Two pixels are connected if a path exists between them.
    - **Connected Component:** A maximal set of pixels where any two are connected. Used in labeling and object detection.
    - **Distance Measures:**
        - **Euclidean:** `D_e = √((x1-x2)² + (y1-y2)²)`.
        - **City-Block (Manhattan):** `D_4 = |x1-x2| + |y1-y2|`.
        - **Chessboard:** `D_8 = max(|x1-x2|, |y1-y2|)`.
- **Reference:** [Image Sampling and Quantization - GeeksforGeeks](https://www.geeksforgeeks.org/image-sampling-and-quantization/)

---
# Unit V: Image Compression

## Chapter 1: Fundamentals of Data Compression

### Basics
- **Definition:** Data compression is the process of reducing the number of bits required to represent information by removing redundancy.
- **Why Compression?**
    - **Storage Space:** A raw 1920×1080 color image (24 bpp) = ~6 MB. Video at 30 FPS = ~180 MB/s. Uncompressed storage/streaming is impractical.
    - **Transmission Bandwidth:** Limited network capacity requires efficient encoding for streaming and downloads.
    - **Cost:** Less storage = cheaper hosting; less bandwidth = lower CDN bills.
- **Compression Ratio:** `CR = (Original Size) / (Compressed Size)`. A CR of 10:1 means the compressed file is 10× smaller.
- **Types of Compression:**
    - **Lossless:** Original data can be perfectly reconstructed. Examples: RLE, Huffman, LZW.
    - **Lossy:** Some information is permanently discarded. Examples: JPEG, MPEG.
    - **Hybrid:** Combines both — e.g., JPEG uses DCT (lossy) + Huffman (lossless).
- **Source Coding:** Encoding data at the source to reduce redundancy before transmission/storage. Two major types:
    - **Entropy Coding:** Assigns codes based on probability (Huffman, Arithmetic).
    - **Dictionary Coding:** Replaces repeated patterns with references (LZW, LZ77).
- **Entropy (Information Theory):**
    - Shannon entropy `H = -Σ p_i · log₂(p_i)` where `p_i` is the probability of symbol `i`.
    - Represents the theoretical minimum average bits per symbol.
    - If a symbol has `p = 1`, entropy contribution is 0 (no information).
    - Example: Fair coin (p = 0.5 each) → `H = 1 bit` per toss. Biased coin (p = 0.9, 0.1) → `H ≈ 0.47 bits`.
- **Redundancy:** Difference between actual encoded bits and entropy. `Redundancy = Actual Bits − Entropy`. A good compressor eliminates redundancy.
- **Data Redundancy Types:**
    - **Spatial Redundancy:** Nearby pixels are similar (used by JPEG).
    - **Temporal Redundancy:** Nearby frames are similar (used by MPEG).
    - **Coding Redundancy:** Suboptimal code lengths (fixed vs variable-length).
    - **Psychovisual Redundancy:** Human eye is less sensitive to certain details (used by JPEG/MPEG).
- **Hybrid Coding:** Combining multiple techniques. Example: JPEG = DCT (lossy transform) + Quantization (lossy) + Huffman (lossless entropy coding).
- **Reference:** [Data Compression Basics - GeeksforGeeks](https://www.geeksforgeeks.org/data-compression-and-its-types/)

---

## Chapter 2: Lossless Compression Techniques

### Run Length Encoding (RLE)
- **Concept:** Replaces sequences of identical pixels with a `(count, value)` pair.
- **Example:** The row `AAAAAABBBCCCC` becomes `6A 3B 4C`.
- **Algorithm Steps:**
    1. Traverse the data stream.
    2. Count consecutive identical values.
    3. Emit a pair `(count, value)` when the value changes.
- **Effective for:**
    - **Binary images:** Only 2 possible values — long runs common.
    - **Simple graphics / line art / scanned documents / fax (CCITT Group 3/4).**
- **Ineffective for:**
    - Photographs with noisy pixels — runs are short, overhead is high.
    - Compressed/encrypted data — already randomized.
- **Variants:**
    - **PackBits (TIFF/Apple):** Uses a flag byte to indicate literal or repeat mode.
    - **PCX RLE:** Encodes bytes with a flag bit.
- **Advantages:** Simple, fast, no codebook required.
- **Disadvantages:** Poor ratio on natural images; worst case (every pixel different) doubles the size.
- **Reference:** [Run Length Encoding - GeeksforGeeks](https://www.geeksforgeeks.org/run-length-encoding/)

### Huffman Coding
- **Concept:** Variable-length coding. Assigns shorter codes to more frequent symbols, longer codes to rare ones.
- **Key Property:** Prefix-free (no code is a prefix of another), allowing unambiguous decoding without separators.
- **Algorithm Steps (Building the Huffman Tree):**
    1. Compute frequency of each symbol.
    2. Create a leaf node for each symbol with its frequency.
    3. Repeatedly combine the two lowest-frequency nodes into a new node with their sum as frequency.
    4. Continue until one root remains.
    5. Assign `0` to left branches and `1` to right branches (or vice versa).
    6. Codewords are the paths from root to leaf.
- **Worked Example:**
    - Symbols: A(45%), B(30%), C(15%), D(10%).
    - Combine D+C = 25%, then 25%+B = 55%, then 55%+A = 100%.
    - Codes (one possible tree): A = 0, B = 10, C = 110, D = 111.
    - Average bits per symbol = 0.45·1 + 0.30·2 + 0.15·3 + 0.10·3 = **1.95 bits** vs. 2 bits fixed-length.
- **Optimality:** Huffman is **optimal** for symbol-by-symbol codes with integer bit lengths.
- **Efficiency:** Approaches entropy as symbol count grows.
- **Advantages:** Optimal prefix codes; widely used.
- **Disadvantages:** Requires knowledge of frequencies (two-pass encoding, or adaptive Huffman); code assignment can change between inputs.
- **Applications:** JPEG, PNG, MP3, DEFLATE (ZIP), GZIP.
- **Reference:** [Huffman Coding - GeeksforGeeks](https://www.geeksforgeeks.org/huffman-coding-greedy-algo-3/)

### LZW (Lempel-Ziv-Welch)
- **Concept:** Dictionary-based coding. Builds a dictionary of strings encountered in the data — both encoder and decoder build it identically from scratch.
- **Algorithm Steps (Encoding):**
    1. Initialize dictionary with all single characters (typically 256 entries).
    2. Read input characters one at a time; maintain current string `S`.
    3. If `S + next` is in dictionary: `S = S + next`.
    4. Else: output code for `S`; add `S + next` to dictionary; `S = next`.
    5. Repeat until end of input.
- **Example:** Encoding `TOBEORNOTTOBEORTOBEORNOT` builds dictionary entries like `TO`, `OB`, `BE`, `EO`, `OR`, etc.
- **Decoding:** Uses the same dictionary-building rules; reads codes and reconstructs strings.
- **No Frequency Analysis Needed:** Unlike Huffman, LZW works in one pass.
- **Used in:**
    - **GIF** (Graphics Interchange Format) — up to 8-bit palettes.
    - **TIFF** (Tagged Image File Format) — optional LZW compression.
    - **PDF** — optional LZW for text.
    - **UNIX `compress`** utility.
- **Advantages:** Simple, one-pass, no prior knowledge of data.
- **Disadvantages:** Patent issues (historically — expired in 2003); dictionary can grow unwieldy; poor for text.
- **Comparison with Huffman:**
    - Huffman: symbol-level, needs frequency info.
    - LZW: string-level, adaptive dictionary.
- **Reference:** [LZW Compression Algorithm - GeeksforGeeks](https://www.geeksforgeeks.org/lzw-lempel-ziv-welch-compression-technique/)

### Other Lossless Techniques (Brief)
- **Arithmetic Coding:** Encodes entire message as a single fraction. Better than Huffman for skewed probabilities.
- **DEFLATE:** Combines LZ77 + Huffman. Used in ZIP, GZIP, PNG.
- **LZ77 / LZ78:** Family of dictionary coders. LZW is derived from LZ78.
- **Run-Length + Huffman (CCITT):** Used in fax.

---

## Chapter 3: Lossy Compression Techniques

### DCT (Discrete Cosine Transform)
- **Concept:** Transforms spatial domain data (pixel intensities) into frequency domain coefficients. Discards high-frequency components (which the human eye is less sensitive to).
- **Formula (1D):**
    - `F(u) = C(u) · Σ_{x=0}^{N-1} f(x) · cos((2x+1)uπ / 2N)`.
    - `C(u) = √(1/N)` for `u = 0`, `√(2/N)` for `u > 0`.
- **Formula (2D):** Applied separately to rows and columns of a block (e.g., 8×8).
- **Why Cosine (not Fourier)?** Cosine basis functions have no imaginary component and better energy compaction for real-valued images.
- **Energy Compaction:** Most image energy concentrates in a few low-frequency coefficients. This is what makes DCT ideal for compression.
- **Block Size:** 8×8 is standard in JPEG — balance between frequency resolution and block artifacts.
- **Inverse DCT (IDCT):** Reconstructs the spatial block from coefficients.
- **Reference:** [Discrete Cosine Transform - GeeksforGeeks](https://www.geeksforgeeks.org/discrete-cosine-transform/)

### JPEG (Joint Photographic Experts Group)
- **Concept:** Full pipeline for photographic compression. Combines DCT, Quantization, and Huffman coding.
- **Pipeline (Encoding):**
    1. **Color Space Conversion:** RGB → YCbCr (luminance + chrominance).
    2. **Chroma Subsampling:** 4:2:0 or 4:2:2 — reduces chroma resolution (eye is less sensitive to color detail).
    3. **Block Splitting:** Split each channel into 8×8 blocks.
    4. **DCT:** Apply 2D DCT to each block → 64 coefficients.
    5. **Quantization:** Divide each coefficient by a quantization value (from a quality table). This is the **lossy** step.
    6. **Zig-Zag Scan:** Read coefficients in a zig-zag order to group low-frequency (top-left) to high-frequency (bottom-right).
    7. **Run-Length + Huffman:** Encode the resulting sequence of zeros and non-zeros.
- **Quality Factor:** 1–100. Higher = less quantization = better quality, larger file. Q=75 is a common default.
- **Blocking Artifacts:** At low quality, 8×8 blocks become visible because boundaries don't match.
- **Progressive JPEG:** Encodes multiple passes — rough image first, then refined. Better UX for slow connections.
- **JPEG vs JPEG 2000:** JPEG uses DCT; JPEG 2000 uses wavelet transform — better quality at low bitrates, no blocking artifacts, but slower.
- **Reference:** [JPEG Compression - GeeksforGeeks](https://www.geeksforgeeks.org/jpeg-image-compression/)

### MPEG (Moving Picture Experts Group)
- **Concept:** Standard for video compression. Exploits both spatial (within frame) and temporal (between frames) redundancy.
- **Frame Types:**
    - **I-frames (Intra):** Self-contained — encoded like JPEG. Random access points.
    - **P-frames (Predictive):** Encoded using previous frames (forward prediction). Smaller than I-frames.
    - **B-frames (Bidirectional):** Encoded using both past and future frames. Smallest but require buffering.
- **GOP (Group of Pictures):** A typical pattern like `IBBPBBPBB...`. Sequence starts with I-frame for seeking.
- **Motion Compensation:**
    - Divide frame into macroblocks (typically 16×16).
    - For each block in P/B frame, search previous/future frame for the best matching block.
    - Store a **motion vector** + **residual** (difference).
    - Search strategies: Exhaustive, Three-Step Search, Diamond Search.
- **MPEG Standards Family:**
    - **MPEG-1:** Video CD (VCD). Bitrate ~1.5 Mbps.
    - **MPEG-2:** DVD, digital TV. Bitrate ~4–15 Mbps.
    - **MPEG-4 (Part 2):** DivX, Xvid — streaming.
    - **MPEG-4 (Part 10 / H.264):** AVC — YouTube, Blu-ray.
    - **MPEG-H (Part 2 / H.265):** HEVC — 4K/8K streaming, 50% better than H.264.
    - **MPEG-I (Part 3 / H.266):** VVC — 8K, next-gen streaming.
- **Reference:** [MPEG Compression - GeeksforGeeks](https://www.geeksforgeeks.org/mpeg-compression/)

### Video Compression
- **Concept:** Exploits temporal redundancy (frames are similar). Uses motion estimation and compensation.
- **Redundancy Types in Video:**
    - **Spatial:** Within a frame — handled by DCT.
    - **Temporal:** Between frames — handled by motion estimation.
    - **Statistical:** Symbol frequency — handled by entropy coding.
    - **Psychovisual:** Perceptual limits — handled by chroma subsampling, quantization.
- **Motion Estimation vs Compensation:**
    - **Estimation:** Find motion vectors (encoder side, expensive).
    - **Compensation:** Use vectors to reconstruct (decoder side, cheap).
- **Rate Control:** Balances quality vs. bitrate. Constant Bitrate (CBR) vs Variable Bitrate (VBR).
- **Bitrate Ladders:** Multiple resolutions/bitrates for adaptive streaming (HLS, DASH).
- **Container vs Codec:**
    - **Container:** MP4, MKV, AVI, MOV — holds video, audio, subtitles.
    - **Codec:** H.264, H.265, VP9, AV1 — actual compression algorithm.
- **Modern Codecs (Beyond MPEG):**
    - **VP9:** Google's open codec — YouTube.
    - **AV1:** Royalty-free, ~30% better than H.265. Used by Netflix, YouTube.
- **Reference:** [Video Compression Techniques - GeeksforGeeks](https://www.geeksforgeeks.org/video-compression-techniques/)

### Lossy vs Lossless: Comparison

| Feature | Lossless | Lossy |
|---------|----------|-------|
| **Reconstruction** | Perfect | Approximate |
| **Compression Ratio** | 2:1 to 5:1 typically | 10:1 to 100:1 |
| **Use Cases** | Text, code, archives, medical | Photos, video, audio |
| **Examples** | RLE, Huffman, LZW, PNG, ZIP | JPEG, MPEG, MP3, AAC |
| **Quality Loss** | None | Controlled by quality setting |
| **Reversibility** | Fully reversible | Not reversible |

---

## Additional Reference Materials

For comprehensive coverage of all topics, the following standard textbooks are recommended:

1. **Hearn, D. and Baker, M.P.** *Computer Graphics*. Prentice-Hall of India.
2. **Foley, J.D., Van Dam, A., Feiner, S.K., and Hughes, J.F.** *Computer Graphics: Principles and Practice*. Addison Wesley.
3. **Rogers, D.F.** *Procedural Elements for Computer Graphics*. McGraw-Hill.
4. **Salomon, D.** *Data Compression: The Complete Reference*. Springer.
5. **Sayood, K.** *Introduction to Data Compression*. Morgan Kaufmann.

For compression-specific topics:
- **CMU 15-499/15-853 Course Materials:** Detailed slides on Huffman, LZW, JPEG, MPEG, and JPEG2000.
- **Czech Technical University Compression Notes:** Comprehensive coverage of Huffman, arithmetic, and dictionary methods.
- **JPEG Standard (ITU T.81):** Official specification.
- **MPEG Standards (ISO/IEC 13818, 14496):** Official specifications.

---