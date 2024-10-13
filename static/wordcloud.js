document.addEventListener("DOMContentLoaded", function () {
    fetch("/data")
        .then(response => response.json())
        .then(wordData => {
            console.log(wordData);

            if (wordData.length === 0) {
                console.error("No word data available.");
                return;
            }

            const wordCloudContainer = document.getElementById("wordcloud");

            // Function to draw the word cloud
            function drawWordCloud() {
                const width = wordCloudContainer.offsetWidth;
                const height = wordCloudContainer.offsetHeight;

                // Scale font size based on word frequency with adaptive range
                const maxFrequency = d3.max(wordData, d => d.size);
                const fontSizeScale = d3.scaleSqrt()
                    .domain([1, maxFrequency])
                    .range([10, Math.min(width, height) / 8]);

                // Updated color scale for a bit more vibrancy
                const colorScale = d3.scaleLinear()
                    .domain([1, maxFrequency])
                    .range(["#A3E4D7", "#117A45"]); // Slightly more vibrant green shades

                // Clear any existing SVG elements
                wordCloudContainer.innerHTML = "";

                const svg = d3.select("#wordcloud")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height);

                const layout = d3.layout.cloud()
                    .size([width, height])
                    .words(wordData.map(d => ({ text: d.text, size: fontSizeScale(d.size), frequency: d.size })))
                    .padding(8)
                    .rotate(() => (Math.random() > 0.5 ? 90 : 0))
                    .fontSize(d => d.size)
                    .on("end", draw);

                layout.start();

                function draw(words) {
                    svg.append("g")
                        .attr("transform", `translate(${width / 2}, ${height / 2})`)
                        .selectAll("text")
                        .data(words)
                        .enter()
                        .append("text")
                        .style("font-size", d => `${d.size}px`)
                        .style("fill", d => colorScale(d.frequency)) // Apply the updated color scale
                        .style("cursor", "pointer")
                        .style("transition", "transform 0.2s ease")
                        .attr("text-anchor", "middle")
                        .attr("transform", d => `translate(${d.x}, ${d.y}) rotate(${d.rotate})`)
                        .text(d => d.text)
                        .on("click", function(event, d) {
                            if (d && d.text) {
                                window.location.href = `/articles?word=${encodeURIComponent(d.text)}`;
                            } else {
                                console.error("No text property found in clicked word data:", d);
                            }
                        })
                        .on("mouseover", function() {
                            d3.select(this)
                                .attr("transform", d => `translate(${d.x}, ${d.y}) rotate(${d.rotate}) scale(1.1)`);
                        })
                        .on("mouseout", function() {
                            d3.select(this)
                                .attr("transform", d => `translate(${d.x}, ${d.y}) rotate(${d.rotate}) scale(1.0)`);
                        });
                }
            }

            // Initial draw
            drawWordCloud();

            // Redraw on resize
            window.addEventListener("resize", drawWordCloud);
        })
        .catch(error => console.error("Error loading word data:", error));
});