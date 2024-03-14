"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Chart from "chart.js/auto";

const LocationChart: React.FC = () => {
  const chartRef = useRef<Chart>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://chart-standard-insights-backend.vercel.app/answers/2"
        );
        const locationData = response.data?.data;

        if (locationData) {
          setData(locationData);
          setLoading(false);

          // Count occurrences of each location
          const locations: { [key: string]: number } = {};
          const totalCount = locationData.length;

          locationData.forEach((entry: any) => {
            const location = entry.answer;
            locations[location] = (locations[location] || 0) + 1;
          });

          const labels = Object.keys(locations);
          const counts = Object.values(locations);

          // Calculate percentages
          const percentages = counts.map(
            (count) => ((count / totalCount) * 100).toFixed(2) + "%"
          );

          // Define colors for each bar
          const colors = [
            "#44F1B6",
            "#007F73",
            "#4CCD99",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF8C00",
            "#8A2BE2",
            "#7FFF00",
            "#00CED1",
            // Add more colors as needed
          ];

          // Create Chart instance
          if (chartRef.current) {
            chartRef.current.destroy();
          }
          const ctx = document.getElementById(
            "locationChart"
          ) as HTMLCanvasElement;
          if (ctx) {
            chartRef.current = new Chart(ctx, {
              type: "bar",
              data: {
                labels: labels,
                datasets: [
                  {
                    label: "Location Count",
                    data: counts,
                    backgroundColor: colors,
                    borderRadius: 10,
                    borderWidth: 1,
                  },
                ],
              },
              options: {
                indexAxis: "y",
                scales: {
                  x: {
                    stacked: true,
                    display: false,
                  },
                  y: {
                    stacked: true,
                    grid: {
                      display: false,
                    },
                  },
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: (context: any) => {
                        const locationCount =
                          context.dataset.data[context.dataIndex];
                        const percentage = percentages[context.dataIndex];
                        return `Amount: ${totalCount}, ${context.label}: ${locationCount} (${percentage})`;
                      },
                    },
                  },
                  legend: {
                    display: false,
                  },
                  //@ts-ignore
                  afterDraw: (chart: any) => {
                    const ctx = chart.ctx;
                    const meta = chart.getDatasetMeta(0);
                    meta.data.forEach((bar: any, index: number) => {
                      const locationCount = counts[index];
                      const percentage = percentages[index];
                      const xPos = bar.x + bar.width + 5;
                      const yPos = bar.y + bar.height / 2;
                      ctx.textAlign = "right";
                      ctx.textBaseline = "middle";
                      ctx.fillStyle = "black";
                      ctx.fillText(
                        `${locationCount} (${percentage})`,
                        xPos,
                        yPos
                      );
                    });
                  },
                },
              },
            });
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="w-[90%] mx-auto my-4 flex justify-center items-center">
      <div className="w-full h-96 border-2 rounded-xl p-3">
        {loading && (
          <div className="w-full h-full flex justify-center items-center">
            Loading...
          </div>
        )}
        {!loading && (
          <>
            <div className="flex justify-between items-center mb-3">
              <h1 className="md:text-2xl text-xl font-bold p-2">Locations</h1>
              <h1 className="md:text-lg text-sm text-gray-400 font-semibold p-2">
                Respondents {data.length}
              </h1>
            </div>
            <div className="max-h-80">
              <canvas id="locationChart" className="w-96 h-60 md:h-80"></canvas>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LocationChart;
