"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Chart from "chart.js/auto";

const StackedBarChart: React.FC = () => {
  const chartRef = useRef<Chart>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({});
  const [gData, setGdata] = useState([]);

  const totalMale = gData?.filter(
    (data: any) => data?.answer === "Male"
  ).length;
  const totalFemale = gData?.filter(
    (data: any) => data?.answer === "Female"
  ).length;
  console.log(totalMale);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ageResponse = await axios.get("https://chart-standard-insights-backend.vercel.app/answers/0");
        const genderResponse = await axios.get(
          "https://chart-standard-insights-backend.vercel.app/answers/1"
        );
        const ageData = ageResponse.data?.data;
        const genderData = genderResponse.data?.data;

        if (ageData && genderData) {
       
          setGdata(genderData);
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

          // Iterate over gender data to count occurrences in each age range
          const maleCounts = Array(ageRanges.length).fill(0);
          const femaleCounts = Array(ageRanges.length).fill(0);

          ageData.forEach((item: any) => {
            const ageRange = item.answer;
            const submissionId = item.submissionId;
            const genderMatch = genderData.find(
              (el: any) => el.submissionId === submissionId
            );
            if (genderMatch) {
              const gender = genderMatch.answer;
              const index = ageRanges.indexOf(ageRange);
              if (index !== -1) {
                if (gender === "Male") {
                  maleCounts[index]++;
                } else if (gender === "Female") {
                  femaleCounts[index]++;
                }
              }
            }
          });

          // Calculate percentages
          const malePercentages = maleCounts.map(
            (count: number, index: number) => (count / totalPeople[index]) * 100
          );
          const femalePercentages = femaleCounts.map(
            (count: number, index: number) => (count / totalPeople[index]) * 100
          );

          // Add male and female data to datasets
          processedData.datasets.push({
            label: "Male",
            data: maleCounts,
            backgroundColor: "#E3F4EE",
            borderRadius: 10,
          });
          processedData.datasets.push({
            label: "Female",
            data: femaleCounts,
            backgroundColor: "#44F1B6",
            borderRadius: 10,
          });

          setData({
            processedData,
            totalPeople,
            malePercentages,
            femalePercentages,
          });

          // Create Chart instance
          if (chartRef.current) {
            chartRef.current.destroy();
          }
          const ctx = document.getElementById(
            "stackedBarChart"
          ) as HTMLCanvasElement;
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
                        const maleCount =
                          context.dataset.data[context.dataIndex];
                        const femaleCount =
                          context.dataset.data[
                            context.dataIndex +
                              processedData.datasets.length / 2
                          ];
                        const totalCount = totalPeople[context.dataIndex];
                        const malePercentage = (
                          (maleCount / totalCount) *
                          100
                        ).toFixed(2);
                        const femalePercentage = (
                          (femaleCount / totalCount) *
                          100
                        ).toFixed(2);
                        return `Total: ${totalCount}, Male: ${maleCount} (${malePercentage}%), Female: ${femaleCount} (${femalePercentage}%)`;
                      },
                    },
                  },
                  legend: {
                    position: "right",
         
                    labels: {
                      usePointStyle: true,
                      generateLabels: function (chart: any) {
                        const original = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                        original.forEach((label: any) => {
                          label.text += ` (${totalMale} Male, ${totalFemale} Female)`;
                        });
                        return original;
                      },
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
      <div className="w-[100%] h-96 border-2 rounded-lg pb-10 pl-3">
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
                Respondents {gData.length}
              </h1>
            </div>
            <div className="max-h-80">

            <canvas id="stackedBarChart" width={200} height={200}></canvas>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StackedBarChart;
