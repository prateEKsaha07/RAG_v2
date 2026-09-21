# Unit I: Fundamentals of Computer Graphics

## Chapter 1: Concepts and Applications
### Basic Concepts
- **Definition:** Computer Graphics is the art and science of generating, manipulating, and displaying visual images and models using computers.
- **Core Components:**
    - **Modeling:** Creating a mathematical representation of a 3D or 2D object.
    - **Rendering:** Converting the model into a visual image using lighting, shading, and texture mapping.
    - **Animation:** Simulating movement by manipulating the model over time.
    - **Interaction:** Allowing users to control and manipulate the graphics in real-time.
- **Reference:** [Computer Graphics Basics - GeeksforGeeks](https://www.geeksforgeeks.org/computer-graphics-basics/)
- **Reference:** [Introduction to Computer Graphics - TutorialsPoint](https://www.tutorialspoint.com/computer_graphics/computer_graphics_introduction.htm)

### Applications of Computer Graphics
- **User Interfaces:** GUI (Graphical User Interfaces) for operating systems, mobile apps, and web browsers. They rely heavily on graphics for icons, windows, and visual feedback.
- **Computer-Aided Design (CAD):** Used in engineering, architecture, and automotive design for drafting and modeling. It allows designers to create precise technical drawings and 3D models.
- **Scientific Visualization:** Mapping complex data sets into visual representations (e.g., medical imaging like MRI/CT scans, molecular modeling, weather maps).
- **Entertainment:** Video games, animated movies, and special effects in films. This is one of the largest commercial drivers of graphics technology.
- **Cartography:** Creating maps, satellite imagery analysis, and Geographic Information Systems (GIS).
- **Education and Training:** Flight simulators, medical surgery simulators, and virtual classrooms.
- **Reference:** [Applications of Computer Graphics - GeeksforGeeks](https://www.geeksforgeeks.org/applications-of-computer-graphics/)

## Chapter 2: Graphics Hardware and Devices
### Random Scan (Vector) Devices
- **Definition:** Draws images by directing an electron beam directly to the points where lines are to be drawn. Also known as a Vector display or Calligraphic display.
- **Working Principle:** The display processor maintains a display list (a set of line drawing commands). The beam draws one line at a time, moving directly from one endpoint to the next.
- **Advantages:**
    - Very high resolution.
    - Smooth, continuous lines (no aliasing or jagged edges).
    - Requires less memory (only stores line endpoints, not pixels).
- **Disadvantages:**
    - Limited to line drawings (cannot fill solid areas or display complex images).
    - Flicker can occur if the display list is too long to refresh at 30-60 Hz.
    - Expensive hardware.
- **Reference:** [Random Scan vs Raster Scan - GeeksforGeeks](https://www.geeksforgeeks.org/difference-between-random-scan-and-raster-scan-display/)

### Raster Scan Devices
- **Definition:** Draws images by sweeping an electron beam across the screen row by row, from top to bottom. Also known as a Bitmap display.
- **Working Principle:** The image is stored in a frame buffer as a matrix of pixels. The beam intensity is modulated based on the pixel values in the buffer.
- **Advantages:**
    - Capable of displaying solid fills, complex images, and text.
    - Lower cost.
    - Allows for realistic shading and textures.
- **Disadvantages:**
    - Jagged edges (aliasing) due to discrete pixels.
    - Requires large amounts of memory (frame buffer).
- **Refresh Rate:** The number of times per second the screen is redrawn (typically 60Hz or higher).
- **Reference:** [Raster Scan Display - Javatpoint](https://www.javatpoint.com/computer-graphics-raster-scan-display)

### Input-Output Devices
- **CRT (Cathode Ray Tube):**
    - **Components:** Electron gun, deflection coils, phosphor-coated screen, shadow mask (for color).
    - **Working:** Electron beam hits phosphor, causing it to glow. The glow fades quickly, requiring constant refresh.
- **LCD (Liquid Crystal Display):**
    - **Components:** Backlight, polarizing filters, liquid crystal layer, color filters, electrodes.
    - **Working:** Liquid crystals twist to block or allow light to pass through polarizing filters.
    - **Advantages:** Thin, lightweight, low power consumption.
- **Laser Printer:**
    - **Working:** A laser beam creates a latent electrostatic image on a rotating drum. Toner is attracted to the charged areas and transferred to paper, then fused with heat.
- **Reference:** [Display Devices in Computer Graphics - GeeksforGeeks](https://www.geeksforgeeks.org/display-devices-in-computer-graphics/)

## Chapter 3: Output Primitives (Line and Circle)
### Line Drawing Algorithms - DDA (Digital Differential Analyzer)
- **Type:** Incremental algorithm.
- **Logic:** Calculates intermediate points by stepping along the line based on the slope (m).
- **Algorithm Steps:**
    1.  Calculate `dx = x2 - x1`, `dy = y2 - y1`.
    2.  Calculate `m = dy / dx`.
    3.  If `|m| <= 1`: `x` increments by 1. `y` increments by `m`.
    4.  If `|m| > 1`: `x` increments by `1/m`. `y` increments by 1.
    5.  Plot the rounded coordinates `(round(x), round(y))`.
- **Advantages:** Simple, fast, and easy to implement.
- **Disadvantages:** Uses floating-point arithmetic (slow); accumulates rounding errors.
- **Reference:** [DDA Line Drawing Algorithm - GeeksforGeeks](https://www.geeksforgeeks.org/dda-line-generation-algorithm-computer-graphics/)

### Line Drawing Algorithms - Bresenham's Line Algorithm
- **Type:** Integer-based incremental algorithm.
- **Logic:** Uses a decision variable (error term) to determine which pixel to choose next. It chooses the pixel that is closest to the true mathematical line.
- **Algorithm Steps (for 0 < m < 1):**
    1.  Calculate `dx`, `dy`, `2dy`, `2dy - 2dx`.
    2.  Initial decision parameter `p0 = 2dy - dx`.
    3.  For each `x` from `x1` to `x2`:
        - Plot `(x, y)`.
        - If `p < 0`: `y` remains same, `p = p + 2dy`.
        - If `p >= 0`: `y = y + 1`, `p = p + 2dy - 2dx`.
- **Advantages:** Highly efficient (only integer addition/subtraction); accurate; hardware implementable.
- **Disadvantages:** Slightly more complex to understand than DDA.
- **Reference:** [Bresenham's Line Algorithm - GeeksforGeeks](https://www.geeksforgeeks.org/bresenhams-line-generation-algorithm/)

### Circle Generating Algorithms - Bresenham's Circle Algorithm
- **Symmetry:** A circle is symmetric in 8 octants. We only need to calculate points for one octant (0 to 45 degrees) and reflect them.
- **Algorithm Steps:**
    1.  Start at `(0, r)`.
    2.  Initial decision parameter `d = 3 - 2r`.
    3.  While `x <= y`:
        - Plot 8 symmetric points.
        - If `d < 0`: `d = d + 4x + 6`.
        - If `d >= 0`: `y = y - 1`, `d = d + 4(x - y) + 10`.
        - `x = x + 1`.
- **Reference:** [Bresenham's Circle Drawing Algorithm - GeeksforGeeks](https://www.geeksforgeeks.org/bresenhams-circle-drawing-algorithm/)

### Circle Generating Algorithms - Midpoint Circle Algorithm
- **Logic:** Similar to Bresenham's but uses the circle equation `f(x,y) = x^2 + y^2 - r^2`.
- **Algorithm Steps:**
    1.  Start at `(0, r)`.
    2.  `p0 = 1 - r`.
    3.  While `x <= y`:
        - Plot 8 points.
        - If `p < 0`: `p = p + 2x + 3`.
        - If `p >= 0`: `y = y - 1`, `p = p + 2(x - y) + 5`.
        - `x = x + 1`.
- **Reference:** [Midpoint Circle Drawing Algorithm - GeeksforGeeks](https://www.geeksforgeeks.org/mid-point-circle-drawing-algorithm/)

## Chapter 4: Antialiasing Techniques
### Aliasing
- **Definition:** The jagged, stair-step appearance of lines, curves, or edges due to the discrete nature of pixels in a raster display. Also known as "jaggies."
- **Cause:** The finite resolution of the pixel grid cannot perfectly represent a continuous mathematical line.
- **Reference:** [Antialiasing in Computer Graphics - GeeksforGeeks](https://www.geeksforgeeks.org/antialiasing-in-computer-graphics/)

### Antialiasing Methods
- **Super Sampling (Post-filtering):**
    - **Method:** The scene is sampled at a much higher resolution than the display (e.g., 4x4 sub-pixels per pixel). The color of each pixel is the average of its sub-pixels.
    - **Advantage:** High quality.
    - **Disadvantage:** Computationally expensive.
- **Pixel Weighting (Area Sampling):**
    - **Method:** The contribution of each sub-pixel is weighted based on its distance from the pixel center.
- **Pixel Phasing:**
    - **Method:** Moves the electron beam to a position closer to the true line path. Hardware-based technique used in vector displays.
- **Reference:** [Anti-Aliasing Techniques - TutorialsPoint](https://www.tutorialspoint.com/computer_graphics/antialiasing.htm)

## Chapter 5: Area Filling Algorithms
### Boundary Fill Algorithm
- **Definition:** Fills a region by starting from a seed pixel inside the region and proceeding outward until a boundary color is encountered.
- **Algorithm Steps:**
    1.  Check if the current pixel is the boundary color or the fill color.
    2.  If not, set the pixel to the fill color.
    3.  Recursively call the function for the 4-connected or 8-connected neighbors.
- **Reference:** [Boundary Fill Algorithm - GeeksforGeeks](https://www.geeksforgeeks.org/boundary-fill-algorithm-in-computer-graphics/)

### Flood Fill Algorithm
- **Definition:** Fills a region by starting from a seed pixel and replacing all connected pixels of the *same* color with the new fill color.
- **Algorithm Steps:**
    1.  Check if the current pixel is the old color.
    2.  If yes, set it to the new fill color.
    3.  Recursively call for neighbors.
- **Reference:** [Flood Fill Algorithm - GeeksforGeeks](https://www.geeksforgeeks.org/flood-fill-algorithm-in-computer-graphics/)

### Scan-line Polygon Fill Algorithm
- **Definition:** An efficient algorithm for filling polygons by processing the image line by line (scan lines).
- **Algorithm Steps:**
    1.  **Find Intersections:** For each scan line, find all intersections with the polygon edges.
    2.  **Sort Intersections:** Sort the x-coordinates of the intersections.
    3.  **Pair Intersections:** Pair the intersections (1st with 2nd, 3rd with 4th, etc.).
    4.  **Fill:** Fill the pixels between the paired intersections.
- **Reference:** [Scan Line Polygon Fill Algorithm - GeeksforGeeks](https://www.geeksforgeeks.org/scan-line-polygon-filling-algorithm/)

---

# Unit II: Transformation, Viewing, and Clipping

## Chapter 1: 2-D Transformation
### Basic Transformations
- **Translation:**
    - **Formula:** `x' = x + tx`, `y' = y + ty`.
    - **Description:** Moves the object by a fixed distance in a given direction.
- **Scaling:**
    - **Formula:** `x' = x * sx`, `y' = y * sy`.
    - **Types:** Uniform (sx = sy) and Non-Uniform (sx != sy).
- **Rotation:**
    - **Formula:** `x' = x cosθ - y sinθ`, `y' = x sinθ + y cosθ`.
- **Reflection:**
    - **X-axis:** `y' = -y`.
    - **Y-axis:** `x' = -x`.
- **Shear:**
    - **X-Shear:** `x' = x + shx * y`, `y' = y`.
    - **Y-Shear:** `x' = x`, `y' = shy * x + y`.
- **Reference:** [2D Transformation in Computer Graphics - GeeksforGeeks](https://www.geeksforgeeks.org/2d-transformation-in-computer-graphics/)

### Matrix Representation and Homogeneous Coordinates
- **Homogeneous Coordinates:**
    - A 2D point `(x, y)` is represented as `(x, y, 1)` in 3D space.
    - **Why?** Allows translation to be performed as a matrix multiplication.
- **Composite Transformations:**
    - Combining multiple transformations into a single matrix by multiplying the matrices.
    - **Order Matters:** `M_total = M_translation * M_rotation * M_scaling`.
- **Reference:** [Homogeneous Coordinates - GeeksforGeeks](https://www.geeksforgeeks.org/homogeneous-coordinates-in-computer-graphics/)

## Chapter 2: Two-Dimensional Viewing
### Viewing Pipeline
- **Window:** The rectangular area in world coordinates that we want to display.
- **Viewport:** The rectangular area on the display device where the window is mapped.
- **Window-to-Viewport Transformation:**
    - **Formula:** `sx = (xv_max - xv_min) / (xw_max - xw_min)`
    - **Formula:** `sy = (yv_max - yv_min) / (yw_max - yw_min)`
- **Reference:** [Window to Viewport Transformation - GeeksforGeeks](https://www.geeksforgeeks.org/window-to-viewport-transformation-in-computer-graphics/)

## Chapter 3: Clipping Operations
### Line Clipping - Cohen-Sutherland
- **Region Codes (Outcodes):** A 4-bit code is assigned to each endpoint of a line.
    - Bit 1 (Left): 1 if x < xmin.
    - Bit 2 (Right): 1 if x > xmax.
    - Bit 3 (Bottom): 1 if y < ymin.
    - Bit 4 (Top): 1 if y > ymax.
- **Algorithm Steps:**
    1.  Compute outcodes for both endpoints.
    2.  **Trivial Acceptance:** If both codes are 0000, the line is inside.
    3.  **Trivial Rejection:** If the bitwise AND of the codes is not 0000, the line is completely outside.
    4.  **Clipping:** Find intersection point with a window edge, replace outside endpoint, and repeat.
- **Reference:** [Cohen-Sutherland Line Clipping Algorithm - GeeksforGeeks](https://www.geeksforgeeks.org/line-clipping-set-1-cohen-sutherland-algorithm/)

### Line Clipping - Liang-Barsky
- **Logic:** Uses parametric equations of the line: `x = x1 + u * dx`, `y = y1 + u * dy`.
- **Algorithm Steps:**
    1.  Calculate `dx`, `dy`.
    2.  Initialize `u1 = 0`, `u2 = 1`.
    3.  For each boundary (left, right, bottom, top): Calculate `p` and `q`.
    4.  If `u1 > u2`: Reject. Else, calculate clipped endpoints.
- **Advantages:** More efficient than Cohen-Sutherland.
- **Reference:** [Liang-Barsky Line Clipping Algorithm - GeeksforGeeks](https://www.geeksforgeeks.org/line-clipping-set-2-liang-barsky/)

### Polygon Clipping - Sutherland-Hodgman
- **Logic:** Clips a polygon against each window edge sequentially.
- **Algorithm Steps:**
    1.  Start with a list of polygon vertices.
    2.  For each window edge (Left, Right, Bottom, Top): Create a new list of vertices.
    3.  For each edge of the polygon: Output vertices based on inside/outside status.
    4.  The final list is the clipped polygon.
- **Disadvantages:** Can produce multiple disconnected polygons for concave polygons.
- **Reference:** [Sutherland-Hodgman Polygon Clipping Algorithm - GeeksforGeeks](https://www.geeksforgeeks.org/polygon-clipping-sutherland-hodgman-algorithm/)

### Polygon Clipping - Weiler-Atherton
- **Logic:** Handles concave polygons and can output multiple polygons correctly.
- **Algorithm Steps:**
    1.  Create a list of polygon vertices and a list of window vertices.
    2.  Find all intersection points between the polygon and the window.
    3.  Traverse the polygon boundary. When an intersection is hit, switch to the window boundary.
    4.  Continue until the start point is reached.
- **Advantages:** Handles complex concave polygons correctly.
- **Reference:** [Weiler-Atherton Polygon Clipping Algorithm - GeeksforGeeks](https://www.geeksforgeeks.org/weiler-atherton-polygon-clipping-algorithm/)

---

# Unit III: 3D Transformation, Visible Surface Detection, and Curves

## Chapter 1: Visible Surface Detection Algorithms
### Object-Space vs. Image-Space Methods
- **Object-based (Object-space):** Compares objects in the scene to determine visibility. Works in continuous world coordinates.
- **Image-based (Image-space):** Works at the pixel level on the projection plane. Determines which object is visible at each pixel.
- **Reference:** [Visible Surface Detection - GeeksforGeeks](https://www.geeksforgeeks.org/visible-surface-detection-in-computer-graphics/)

### Depth Comparison (Z-Buffer)
- **Type:** Image-space method.
- **Data Structures:**
    - **Frame Buffer:** Stores the color of each pixel.
    - **Depth Buffer (Z-Buffer):** Stores the depth (z-value) of the closest object at each pixel.
- **Algorithm Steps:**
    1.  Initialize all depth buffer values to infinity.
    2.  For each polygon, for each pixel: Calculate depth `z`. If `z < depth_buffer[x][y]`, update buffer and color.
- **Advantages:** Simple, works for any object shape, handles intersecting objects.
- **Disadvantages:** Requires large memory, cannot handle transparency directly.
- **Reference:** [Z-Buffer Algorithm - GeeksforGeeks](https://www.geeksforgeeks.org/z-buffer-depth-buffer-method/)

### A-Buffer
- **Definition:** An extension of the Z-buffer that handles transparency and anti-aliasing.
- **Logic:** Stores a list of fragments (color, depth, opacity) for each pixel.
- **Reference:** [A-Buffer Method - GeeksforGeeks](https://www.geeksforgeeks.org/a-buffer-method/)

### Back Face Removal
- **Definition:** Removing polygons that face away from the camera.
- **Logic:** Calculate the normal vector of the polygon. If dot product of normal and view vector is positive, the polygon is facing away and can be culled.
- **Advantages:** Reduces the number of polygons to process by ~50%.
- **Reference:** [Back Face Removal Algorithm - GeeksforGeeks](https://www.geeksforgeeks.org/back-face-removal-algorithm-in-computer-graphics/)

### Scan-line Method
- **Type:** Image-space method.
- **Logic:** Processes the image line by line (scan lines).
- **Algorithm Steps:**
    1.  Maintain an Active Edge Table (AET) for the current scan line.
    2.  For each scan line, find intersections with polygons.
    3.  Sort intersections by depth.
    4.  Determine the visible surface at each pixel.
- **Reference:** [Scan Line Algorithm for Visible Surface Detection - GeeksforGeeks](https://www.geeksforgeeks.org/scan-line-algorithm-for-visible-surface-detection/)

### Depth Sorting Method (Painter's Algorithm)
- **Type:** Object-space method.
- **Logic:** Sorts polygons by depth (furthest to closest) and paints them in order.
- **Issues:** Cyclic overlaps, intersecting polygons.
- **Advantages:** Simple, fast for simple scenes.
- **Reference:** [Painter's Algorithm - GeeksforGeeks](https://www.geeksforgeeks.org/painters-algorithm-in-computer-graphics/)

### Area Subdivision Method (Warnock's Algorithm)
- **Type:** Image-space method.
- **Logic:** Recursively subdivides the view plane into smaller rectangles until a decision can be made.
- **Algorithm Steps:**
    1.  If area is empty, stop.
    2.  If area is entirely inside one polygon, fill it.
    3.  If area is entirely outside all polygons, fill with background color.
    4.  If complex, subdivide into 4 quadrants and repeat.
- **Reference:** [Warnock's Algorithm - GeeksforGeeks](https://www.geeksforgeeks.org/warnocks-algorithm-in-computer-graphics/)

## Chapter 2: 3-D Transformation
### 3D Transformations
- **Translation:** `(x, y, z)` -> `(x+tx, y+ty, z+tz)`.
- **Scaling:** `(x, y, z)` -> `(x*sx, y*sy, z*sz)`.
- **Rotation:**
    - **X-axis:** `y' = y cosθ - z sinθ`, `z' = y sinθ + z cosθ`.
    - **Y-axis:** `x' = x cosθ + z sinθ`, `z' = -x sinθ + z cosθ`.
    - **Z-axis:** `x' = x cosθ - y sinθ`, `y' = x sinθ + y cosθ`.
- **Reflection:** Across planes (XY, YZ, XZ).
- **Reference:** [3D Transformation in Computer Graphics - GeeksforGeeks](https://www.geeksforgeeks.org/3d-transformation-in-computer-graphics/)

### 3-D Viewing Projections
- **Parallel Projection:**
    - Projectors are parallel.
    - Preserves relative proportions.
    - **Orthographic:** Projectors perpendicular to view plane.
    - **Oblique:** Projectors at an angle to view plane (e.g., Cavalier, Cabinet).
- **Perspective Projection:**
    - Projectors converge at a center of projection (eye).
    - Produces realistic depth but does not preserve proportions.
    - **Vanishing Points:** Parallel lines converge at a vanishing point.
- **Reference:** [3D Viewing Projections - GeeksforGeeks](https://www.geeksforgeeks.org/projections-in-computer-graphics/)

### 3D Object Representations
- **Boundary Representations (B-reps):** Describes objects by their surfaces (e.g., polygons, splines).
- **Spatial Partitioning:** Divides space into regions (e.g., Octrees, BSP trees).
- **Constructive Solid Geometry (CSG):** Combines simple primitives (cubes, spheres) using boolean operations.
- **Reference:** [3D Object Representation - GeeksforGeeks](https://www.geeksforgeeks.org/3d-object-representation-in-computer-graphics/)

## Chapter 3: Curved Lines and Surfaces
### Spline Representations
- **Interpolating Curves:** Curve passes through all control points.
- **Approximating Curves:** Curve is pulled towards but does not necessarily pass through control points.
- **Continuity Conditions:**
    - **C0:** Position continuity (endpoints meet).
    - **C1:** Tangent continuity (slopes match).
    - **C2:** Curvature continuity (rates of change of slopes match).
- **Reference:** [Spline Curves in Computer Graphics - GeeksforGeeks](https://www.geeksforgeeks.org/spline-curves-in-computer-graphics/)

### Bezier Curves
- **Concept:** Defined by a set of control points. The curve starts at the first point and ends at the last.
- **Characteristics:**
    - Convex hull property: Curve lies within the convex hull of control points.
    - Uses Bernstein polynomials as basis functions.
    - Degree of curve = (number of control points - 1).
- **Formula:** `P(t) = Σ Pi * Bi,n(t)` where `Bi,n(t)` is the Bernstein polynomial.
- **Advantages:** Easy to implement, intuitive control.
- **Disadvantages:** No local control (moving one point affects the whole curve).
- **Reference:** [Bezier Curves - GeeksforGeeks](https://www.geeksforgeeks.org/bezier-curves-in-computer-graphics/)

### B-Spline Curves
- **Concept:** Generalization of Bezier curves.
- **Characteristics:**
    - Local control: Moving a control point only affects a local portion of the curve.
    - Defined by control points, knot vector, and degree.
    - Can be uniform or non-uniform (NURBS).
- **Formula:** `P(t) = Σ Pi * Ni,k(t)` where `Ni,k(t)` is the B-spline basis function.
- **Advantages:** Local control, smooth continuity, flexible.
- **Disadvantages:** More complex to implement.
- **Reference:** [B-Spline Curves - GeeksforGeeks](https://www.geeksforgeeks.org/b-spline-curves-in-computer-graphics/)

---

# Unit IV: Introduction to Image Processing

## Chapter 1: Fundamentals of Image Processing
### Basics and Applications
- **Origin:** Evolved from digital signal processing and military/medical imaging needs.
- **Applications:** Medical imaging (MRI, CT), Remote Sensing, Surveillance, Robotics, Image Restoration.
- **Components of a DIP System:**
    1.  Image Acquisition (Sensors).
    2.  Storage (Hard disk, RAM).
    3.  Processing (CPU/GPU).
    4.  Communication (Networks).
    5.  Display (Monitors, Printers).
- **Reference:** [Fundamentals of Image Processing - GeeksforGeeks](https://www.geeksforgeeks.org/fundamentals-of-image-processing/)

### Image Formation and Resolution
- **Image Formation Model:** Light source -> Object -> Lens -> Sensor -> Digital Image.
- **Spatial Resolution:** Number of pixels per unit area (e.g., DPI). Determines detail.
- **Gray Level Resolution:** Number of bits used to represent intensity (e.g., 8-bit = 256 levels).
- **Quantization:** Converting continuous intensity values to discrete levels.
- **Reference:** [Image Formation and Resolution - TutorialsPoint](https://www.tutorialspoint.com/dip/image_formation.htm)

## Chapter 2: Image Enhancement in Spatial Domain
### Basic Techniques
- **Piecewise Transformation Functions:**
    - **Identity:** No change.
    - **Negative:** `s = L - 1 - r` (inverts colors).
    - **Log:** `s = c * log(1 + r)` (expands dark pixels, compresses bright).
    - **Power-Law (Gamma):** `s = c * r^γ` (corrects monitor gamma).
- **Histogram Equalization:**
    - Transforms the image so that the histogram is uniform. Increases global contrast.
    - **Formula:** `s = T(r) = (L-1) * Σ (ni / n)`.
- **Histogram Specification (Matching):**
    - Transforms the image so that its histogram matches a target histogram.
- **Image Averaging:** Reduces random noise by averaging multiple images of the same scene.
- **Reference:** [Image Enhancement in Spatial Domain - GeeksforGeeks](https://www.geeksforgeeks.org/image-enhancement-in-spatial-domain/)

### Spatial Filters
- **Smoothing Filters (Low Pass):**
    - **Linear:** Averaging, Gaussian Blur. Removes noise, blurs edges.
    - **Order-Statistic:** Median filter. Excellent for salt-and-pepper noise.
- **Sharpening Filters (High Pass):**
    - **Laplacian:** Second derivative mask. Enhances edges.
    - **Unsharp Masking:** Subtracting a blurred version from the original.
- **Reference:** [Spatial Filtering in Image Processing - GeeksforGeeks](https://www.geeksforgeeks.org/spatial-filtering-in-image-processing/)

### Sampling and Quantization
- **Sampling:** Digitizing the spatial coordinates (x, y).
- **Quantization:** Digitizing the amplitude (intensity).
- **Relationships between Pixels:**
    - **Neighbors:** 4-neighbors (N4), Diagonal neighbors (ND), 8-neighbors (N8).
    - **Adjacency:** 4-adjacency, 8-adjacency, m-adjacency (mixed).
    - **Connectivity:** Paths and connected components.
- **Reference:** [Image Sampling and Quantization - GeeksforGeeks](https://www.geeksforgeeks.org/image-sampling-and-quantization/)

---

# Unit V: Image Compression

## Chapter 1: Fundamentals of Data Compression
### Basics
- **Storage Space:** Compression reduces the physical storage required.
- **Coding Requirements:** Needs to be efficient for transmission over bandwidth-limited channels.
- **Source Coding:** Compressing data at the source.
- **Entropy:** The average information content per symbol. A measure of the minimum bits required.
- **Hybrid Coding:** Combining multiple techniques (e.g., DCT + Huffman).
- **Reference:** [Data Compression Basics - GeeksforGeeks](https://www.geeksforgeeks.org/data-compression-and-its-types/)

## Chapter 2: Lossless Compression Techniques
### Run Length Encoding (RLE)
- **Concept:** Replaces sequences of identical pixels with a count and value.
- **Effective for:** Binary images or simple graphics.
- **Reference:** [Run Length Encoding - GeeksforGeeks](https://www.geeksforgeeks.org/run-length-encoding/)

### Huffman Coding
- **Concept:** Variable-length coding. Assigns shorter codes to more frequent symbols. Creates a binary tree based on probabilities.
- **Reference:** [Huffman Coding - GeeksforGeeks](https://www.geeksforgeeks.org/huffman-coding-greedy-algo-3/)

### LZW (Lempel-Ziv-Welch)
- **Concept:** Dictionary-based coding. Builds a dictionary of strings encountered in the data.
- **Used in:** GIF and TIFF formats.
- **Reference:** [LZW Compression Algorithm - GeeksforGeeks](https://www.geeksforgeeks.org/lzw-lempel-ziv-welch-compression-technique/)

## Chapter 3: Lossy Compression Techniques
### DCT (Discrete Cosine Transform)
- **Concept:** Transforms spatial domain data into frequency domain. Discards high-frequency components (which the human eye is less sensitive to).
- **Reference:** [Discrete Cosine Transform - GeeksforGeeks](https://www.geeksforgeeks.org/discrete-cosine-transform/)

### JPEG
- **Concept:** Uses DCT, Quantization, and Huffman coding. Standard for photographic images.
- **Reference:** [JPEG Compression - GeeksforGeeks](https://www.geeksforgeeks.org/jpeg-image-compression/)

### MPEG
- **Concept:** Uses motion compensation and DCT. Standard for video compression.
- **Types:** I-frames (Intra), P-frames (Predictive), B-frames (Bidirectional).
- **Reference:** [MPEG Compression - GeeksforGeeks](https://www.geeksforgeeks.org/mpeg-compression/)

### Video Compression
- **Concept:** Exploits temporal redundancy (frames are similar). Uses motion estimation and compensation.
- **Reference:** [Video Compression Techniques - GeeksforGeeks](https://www.geeksforgeeks.org/video-compression-techniques/)

---

## Additional Reference Materials

For comprehensive coverage of all topics, the following standard textbooks are recommended:

1. **Hearn, D. and Baker, M.P.** *Computer Graphics*. Prentice-Hall of India.
2. **Foley, J.D., Van Dam, A., Feiner, S.K., and Hughes, J.F.** *Computer Graphics: Principles and Practice*. Addison Wesley.
3. **Rogers, D.F.** *Procedural Elements for Computer Graphics*. McGraw-Hill.

For compression-specific topics:
- **CMU 15-499/15-853 Course Materials:** Detailed slides on Huffman, LZW, JPEG, MPEG, and JPEG2000.
- **Czech Technical University Compression Notes:** Comprehensive coverage of Huffman, arithmetic, and dictionary methods.