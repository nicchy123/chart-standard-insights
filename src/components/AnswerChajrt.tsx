"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Chart from "chart.js/auto";
import "chartjs-plugin-datalabels";


const GroupedBarChart: React.FC = () => {
  const chartRef = useRef<Chart>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [questions, setQuestions] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://chart-standard-insights-backend.vercel.app/answers/four/new"
        );
        const responseData = response.data?.data;

        const questionsRes = await axios.get(
          "https://chart-standard-insights-backend.vercel.app/questions"
        );
        console.log(questionsRes?.data?.data[3]);
        setQuestions(questionsRes?.data?.data[3] as any);

        if (responseData) {
          setData(responseData);
          setLoading(false);

          // Prepare data for chart and table
          const chartLabels: string[] = [];
          const chartData: number[] = [];
          const tableData: any[] = [];

          responseData.forEach((item: any) => {
            chartLabels.push(item.answer.substring(0, 25)); // Limit question label to 25 characters
            chartData.push(item.percentage);
            tableData.push({
              answer: item.answer,
              count: item.count,
              percentage: item.percentage.toFixed(2),
            });
          });

          // Generate random colors for each bar
          const generatedColors = chartData.map(() => getRandomColor());
          setColors(generatedColors);

          // Create Chart instance
          if (chartRef.current) {
            chartRef.current.destroy();
          }
          const ctx = document.getElementById(
            "groupedBarChart"
          ) as HTMLCanvasElement;
          if (ctx) {
            chartRef.current = new Chart(ctx, {
              type: "bar",
              data: {
                labels: chartLabels,
                datasets: [
                  {
                    label: "Amount",
                    data: chartData,
                    backgroundColor: generatedColors,
                    borderRadius: 10, // Round corners of bars
                  },
                ],
              },

              options: {
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: "Percentage",
                    },
                  },
                },

                plugins: {
                  datalabels: {
                    color: "#000",
                    font: {
                      weight: "bold",
                    },
                    anchor: "end",
                    align: "top",
                    formatter: (value: any, context: any) => {
                      return `${value}%`;
                    },
                  },
                },
              },
            });
          }

          // Set table data
          setTableData(tableData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Function to generate random color
  const getRandomColor = (): string => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  return (
    <div className="lg:w-[90%] w-[100%] mx-auto my-4 flex lg:flex-row flex-col justify-center items-start gap-3">
      <div className="lg:w-[60%] w-[90%] mx-auto h-full border-2 rounded-lg pb-10 pl-3">
        {loading && (
          <div className="w-full h-full flex justify-center items-center">
            Loading
          </div>
        )}

        {!loading && (
          <>
            <div className="flex justify-between items-center">
              <h1 className="md:text-2xl text-xl font-bold p-2 my-4">
                {(questions as any)?.question}
              </h1>
            </div>
            <div className="w-full h-full">
              <canvas id="groupedBarChart" width={1200} height={1000}></canvas>

              <div className="my-4">
                <h3 className="font-semibold">Other :</h3>
                {(questions as any).otherOptions.map(
                  (option: string, index: number) => (
                    <p className="p-1 bg-gray-100 text-sm rounded-md max-w-80" key={index}>{option}</p>
                  )
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <div className="lg:w-[40%] w-[90%] mx-auto ">
        <table className="border border-gray-200 w-[100%] ">
          <thead>
            <tr className="bg-gray-300 ">
              <th className="border border-gray-200 p-3">Answers</th>
              <th className="border border-gray-200 p-3">Response</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((item, index) => (
              <tr key={index}>
                <td className="text-sm border p-3 border-gray-200">
                  {item.answer}
                </td>
                <td className="text-sm border p-3 border-gray-200">
                  {item.count} ({item.percentage}%)
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GroupedBarChart;
