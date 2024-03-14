"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Chart from "chart.js/auto";

const StackedBarChart: React.FC = () => {
  const chartRef = useRef<Chart>();
  const [loading, setLoading] = useState(true);
  const [genderData, setGenderData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch age and gender data
        const ageResponse = await axios.get("https://chart-standard-insights-backend.vercel.app/answers/0");
        const genderResponse = await axios.get("https://chart-standard-insights-backend.vercel.app/answers/1");
        const ageData = ageResponse.data?.data;
        const genderData = genderResponse.data?.data;

        if (ageData && genderData) {
          setGenderData(genderData);
          setLoading(false);

          // Define age range groups
          const ageRanges = [
            "21-25",
            "26-30",
            "31-35",
            "36-40",
            "41-45",
            "46-50",
            "51-55",
            "56-60",
          ];

          // Initialize data object
          const processedData: any = {
            labels: ageRanges,
            datasets: [],
          };

          // Calculate total number of people in each age range
          const totalPeople = Array(ageRanges.length).fill(0);
          ageData.forEach((item: any) => {
            const ageRange = item.answer;
            const index = ageRanges.indexOf(ageRange);
            if (index !== -1) {
              totalPeople[index]++;
            }
          });

          // Filter gender data for males and females
          const maleData = genderData.filter((item: any) => item.answer === "Male");
          const femaleData = genderData.filter((item: any) => item.answer === "Female");

          // Calculate male and female counts in each age range
          const maleCounts = Array(ageRanges.length).fill(0);
          const femaleCounts = Array(ageRanges.length).fill(0);

          maleData.forEach((item: any) => {
            const ageRange = ageData.find((el: any) => el.submissionId === item.submissionId)?.answer;
            const ageIndex = ageRanges.indexOf(ageRange);
            if (ageIndex !== -1) {
              maleCounts[ageIndex]++;
            }
          });

          femaleData.forEach((item: any) => {
            const ageRange = ageData.find((el: any) => el.submissionId === item.submissionId)?.answer;
            const ageIndex = ageRanges.indexOf(ageRange);
            if (ageIndex !== -1) {
              femaleCounts[ageIndex]++;
            }
          });

          // Add male and female data to datasets
          processedData.datasets.push({
            label: `Male (${maleData.length})`,
            data: maleCounts,
            backgroundColor: "#E3F4EE",
            borderRadius: 10,
          });
          processedData.datasets.push({
            label: `Female (${femaleData.length})`,
            data: femaleCounts,
            backgroundColor: "#44F1B6",
            borderRadius: 10,
          });

          // Create Chart instance
          if (chartRef.current) {
            chartRef.current.destroy();
          }
          const ctx = document.getElementById("stackedBarChart") as HTMLCanvasElement;
          if (ctx) {
            chartRef.current = new Chart(ctx, {
              type: "bar",
              data: processedData,
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
                        const dataIndex = context.dataIndex;
                        const maleCount = processedData.datasets[0].data[dataIndex];
                        const femaleCount = processedData.datasets[1].data[dataIndex];
                        const totalCount = totalPeople[dataIndex];
                        const malePercentage = ((maleCount / totalCount) * 100).toFixed(2);
                        const femalePercentage = ((femaleCount / totalCount) * 100).toFixed(2);
                        return `Total: ${totalCount}, Male: ${maleCount} (${malePercentage}%),
                                Female: ${femaleCount} (${femalePercentage}%)
                                Other: ${femaleCount} (${femalePercentage}%)
                                
                                `;
                      },
                    },
                  },
                  legend: {
                    position: "right",
                    labels: {
                      usePointStyle: true,
                    },
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
      <div className="w-[100%] h-full border-2 rounded-lg pb-10 pl-3">
        {loading && (
          <div className="w-full h-96 flex justify-center items-center">
            Loading
          </div>
        )}

        {!loading && (
          <>
            <div className="flex justify-between items-center">
              <h1 className="md:text-2xl text-xl font-bold p-2">
                Age & Gender
              </h1>
              <h1 className="md:text-lg text-sm text-gray-400 font-semibold p-2">
                Respondents {genderData.length}
              </h1>
            </div>
            <div className="max-h-96">
              <canvas id="stackedBarChart" width={1200} height={1000}></canvas>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StackedBarChart;
