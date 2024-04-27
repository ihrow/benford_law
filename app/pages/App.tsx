"use client";
import { Calendar } from "primereact/calendar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { BTCPriceDB, BenfordDistribution } from "../types";
import { Chart } from "primereact/chart";
import { Dropdown } from "primereact/dropdown";
import { Card } from "primereact/card";
import { Toast } from "primereact/toast";

import { Skeleton } from "primereact/skeleton";
import LoadingOverlay from "../components/LoadingOverlay";
import { Message } from "primereact/message";

export default function App() {
  const toast = useRef<Toast>(null);
  const showError = (message: string) => {
    toast.current?.show({
      severity: "error",
      summary: "Error",
      detail: message,
      life: 3000,
    });
  };
  const columns = [
    { field: "one", header: "One" },
    { field: "two", header: "Two" },
    { field: "three", header: "Three" },
    { field: "four", header: "Four" },
    { field: "five", header: "Five" },
    { field: "six", header: "Six" },
    { field: "seven", header: "Seven" },
    { field: "eight", header: "Eight" },
    { field: "nine", header: "Nine" },
  ];
  const [data, setData] = useState<BenfordDistribution[]>();
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [visibleColumns, setVisibleColumns] = useState(columns);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const [dates, setDates] = useState<Date[]>([yesterday, new Date()]);

  async function getData() {
    if (dates.length !== 2 || dates[0] == null || dates[1] == null) {
      return;
    }
    if (dates[1].getTime() - dates[0].getTime() > 5 * 24 * 60 * 60 * 1000) {
      setStep(24);
    }
    const dataSets = [] as any[];
    const responseData = await axios.get(
      `/api/frontend/getBenford?from=${dates[0].toLocaleDateString()}&to=${dates[1].toLocaleDateString()}&step=${step}`
    );
    if (responseData.data.message) {
      setLoadingData(false);
      showError(responseData.data.message);
      return;
    }
    setData(responseData.data);
    dataSets.push({
      label: "MAD",
      data: responseData.data.map((d: BenfordDistribution) => d.MAD),
      yAxisID: "y1",
      tension: 0.2,
    });
    dataSets.push({
      label: "SSD",
      data: responseData.data.map((d: BenfordDistribution) => d.SSD),
      yAxisID: "y2",
      tension: 0.2,
    });

    const responseBTC = await axios.get(
      `/api/frontend/getBTCPrice?from=${dates[0].toLocaleDateString()}&to=${dates[1].toLocaleDateString()}&step=${step}`
    );
    if (responseBTC.data.message) {
      setLoadingData(false);
      showError(responseBTC.data.message);
      return;
    }
    dataSets.push({
      label: "BTC Price",
      data: responseBTC.data.map((d: BTCPriceDB) => d.BTC),
      yAxisID: "y",
      tension: 0.2,
    });
    const data = {
      labels: responseData.data.map((d: BenfordDistribution) =>
        new Date(d.createdAt).toLocaleString()
      ),
      datasets: dataSets,
    };
    setChartData(data);
    setChartOptions({
      stacked: false,
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        zoom: {
          zoom: {
            wheel: {
              enabled: true,
            },
            drag: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
            mode: "x",
          },
        },
        legend: {
          labels: {
            color: "white",
          },
        },
      },
      y: {
        type: "linear",
        display: true,
        position: "left",
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
      },
      y2: {
        type: "linear",
        display: true,
        position: "right",
      },
      scales: {
        x: {
          ticks: {
            color: "#fefbf1",
          },
          title: {
            display: true,
            text: "Datetime",
            color: "#fefbf1",
          },
        },
        y: {
          ticks: {
            color: "#fefbf1",
          },
          title: {
            display: true,
            text: "BTC Price",
            color: "#fefbf1",
          },
        },
        y1: {
          ticks: {
            color: "#fefbf1",
          },
          title: {
            display: true,
            text: "MAD",
            color: "#fefbf1",
          },
        },
        y2: {
          ticks: {
            color: "#fefbf1",
          },
          title: {
            display: true,
            text: "SSD",
            color: "#fefbf1",
          },
        },
      },
    });
    setLoadingData(false);
  }

  const imageBodyTemplate = (row: BenfordDistribution) => {
    return <span>{new Date(row.createdAt).toLocaleString()}</span>;
  };

  const [chartData, setChartData] = useState<any>({});
  const [chartOptions, setChartOptions] = useState<any>({});

  const [step, setStep] = useState(6);
  useEffect(() => {
    getData();
  }, [dates, step]);

  const selectBoxItems = [
    {
      label: "Every 5 minutes",
      value: 1,
    },
    {
      label: "Every 10 minutes",
      value: 2,
    },
    {
      label: "Every 30 minutes",
      value: 6,
    },
    {
      label: "Every 1 hour",
      value: 12,
    },
    {
      label: "Every 2 hours",
      value: 24,
    },
  ];

  const minDate = new Date("2024-01-14");

  const content = (
    <div className="flex align-items-center ">
      <div className="w-25rem flex justify-content-center">
        <img
          alt="logo"
          src="https://upload.wikimedia.org/wikipedia/commons/6/66/Frank_Benford_%281883_-_1948%29.jpg"
          width="128"
        />
      </div>
      <div className="ml-3 py-4">
        {" "}
        <span className="text-xl">
          <b className="text-2xl">Benford&apos;s Law</b>, also known as the “law of
          first digits” or the “phenomenon of significant digits,” is the
          finding that the first digits (or numerals to be exact) of the numbers
          found in series of records of the most varied sources do not display a
          uniform distribution, but rather, they&apos;re arranged in such a way that
          the digit one is the most frequent, followed by two, three, and so in
          a successively decreasing manner down to nine.
        </span>
      </div>
    </div>
  );
  const contentMAD = (
    <div className="flex align-items-center">
      <math xmlns="http://www.w3.org/1998/Math/MathML">
        <mrow is="true">
          <mi is="true">M</mi>
          <mi is="true">A</mi>
          <mi is="true">D</mi>
          <mo linebreak="goodbreak" is="true">
            =
          </mo>
          <mfrac is="true">
            <mrow is="true">
              <mn is="true">1</mn>
            </mrow>
            <mrow is="true">
              <mn is="true">9</mn>
            </mrow>
          </mfrac>
          <munderover is="true">
            <mrow is="true">
              <mo linebreak="badbreak" is="true">
                &#x2211;
              </mo>
            </mrow>
            <mrow is="true">
              <mi is="true">d</mi>
              <mo linebreak="badbreak" is="true">
                =
              </mo>
              <mn is="true">1</mn>
            </mrow>
            <mrow is="true">
              <mn is="true">9</mn>
            </mrow>
          </munderover>
          <mrow is="true">
            <mo is="true">|</mo>
            <msub is="true">
              <mrow is="true">
                <mi is="true">p</mi>
              </mrow>
              <mrow is="true">
                <mi is="true">d</mi>
              </mrow>
            </msub>
            <mo is="true">&#x2212;</mo>
            <msub is="true">
              <mrow is="true">
                <mover accent="true" is="true">
                  <mrow is="true">
                    <mi is="true">p</mi>
                  </mrow>
                  <mrow is="true">
                    <mo is="true">&#x303;</mo>
                  </mrow>
                </mover>
              </mrow>
              <mrow is="true">
                <mi is="true">d</mi>
              </mrow>
            </msub>
            <mo is="true">|</mo>
          </mrow>
        </mrow>
      </math>
      <div className="ml-3 py-2">
        {" "}
        <span className="text-xl">
          The mean absolute deviation <b>(MAD)</b> of a dataset is the average
          distance between each data point and the mean. It gives us an idea
          about the variability in a dataset.
        </span>
      </div>
    </div>
  );
  const contentSSD = (
    <div className="flex align-items-center">
      <math xmlns="http://www.w3.org/1998/Math/MathML">
        <mrow is="true">
          <mi is="true">S</mi>
          <mi is="true">S</mi>
          <mi is="true">D</mi>
          <mo linebreak="goodbreak" is="true">
            =
          </mo>
          <munderover is="true">
            <mrow is="true">
              <mo linebreak="badbreak" is="true">
                &#x2211;
              </mo>
            </mrow>
            <mrow is="true">
              <mi is="true">d</mi>
              <mo linebreak="badbreak" is="true">
                =
              </mo>
              <mn is="true">1</mn>
            </mrow>
            <mrow is="true">
              <mn is="true">9</mn>
            </mrow>
          </munderover>
          <msup is="true">
            <mrow is="true">
              <mrow is="true">
                <mo is="true">(</mo>
                <msub is="true">
                  <mrow is="true">
                    <mi is="true">p</mi>
                  </mrow>
                  <mrow is="true">
                    <mi is="true">d</mi>
                  </mrow>
                </msub>
                <mo linebreak="badbreak" is="true">
                  &#x2212;
                </mo>
                <msub is="true">
                  <mrow is="true">
                    <mover accent="true" is="true">
                      <mrow is="true">
                        <mi is="true">p</mi>
                      </mrow>
                      <mrow is="true">
                        <mo is="true">&#x303;</mo>
                      </mrow>
                    </mover>
                  </mrow>
                  <mrow is="true">
                    <mi is="true">d</mi>
                  </mrow>
                </msub>
                <mo is="true">)</mo>
              </mrow>
            </mrow>
            <mrow is="true">
              <mn is="true">2</mn>
            </mrow>
          </msup>
        </mrow>
      </math>
      <div className="ml-3 py-2">
        {" "}
        <span className="text-xl">
          The sum of squares measures the deviation of data points away from the
          mean value.
        </span>
      </div>
    </div>
  );

  return (
    <>
      <Toast />
      <div className="md:px-8 sm:px-4 px-0 py-4">
        <div className="w-full text-center">
          <Image
            src="/STU-FEI.png"
            width={581 / 2}
            height={128 / 2}
            alt="STU-FEI"
          />
        </div>
        <div className="text-center w-full text-xl py-2">
          <h1 className="my-1">Benford&apos;s law</h1>
        </div>
        <div className="flex flex-column sm:flex-row gap-2 py-2 ">
          <div className="flex flex-column gap-1">
            <label htmlFor="to">Date range</label>
            <Calendar
              id="to"
              disabled={loadingData}
              selectionMode="range"
              hideOnRangeSelection
              showButtonBar
              value={dates}
              maxDate={new Date()}
              minDate={minDate}
              readOnlyInput
              onChange={(e) => {
                setDates(e.value as Date[]);
              }}
              onClearButtonClick={() => {
                setDates([yesterday, new Date()]);
              }}
            />
          </div>
          <div className="flex flex-column gap-1">
            <label htmlFor="step">Step</label>
            <Dropdown
              loading={loadingData}
              id="step"
              value={step}
              options={selectBoxItems}
              onChange={(e) => {
                setStep(e.value);
              }}
              optionLabel="label"
              placeholder="Select a step"
            />
          </div>
        </div>
        {loadingData ? (
          <Skeleton width="100%" height="32rem" className="my-4" />
        ) : (
          <Chart
            type="line"
            className="py-4"
            height="75vh"
            data={chartData}
            options={chartOptions}
          />
        )}
        <Message
          style={{
            border: "solid #696cff",
            borderWidth: "0 0 0 6px",
            color: "white",
          }}
          className="border-primary w-full justify-content-start mt-4 "
          severity="info"
          content={content}
        />
        <Message
          style={{
            border: "solid #696cff",
            borderWidth: "0 0 0 6px",
            color: "white",
          }}
          className="border-primary w-full justify-content-start my-2 "
          severity="info"
          content={contentMAD}
        />
        <Message
          style={{
            border: "solid #696cff",
            borderWidth: "0 0 0 6px",
            color: "white",
          }}
          className="border-primary w-full justify-content-start  mb-4 "
          severity="info"
          content={contentSSD}
        />
        <Card>
          <DataTable
            value={data}
            loading={loadingData}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
          >
            <Column
              field="createdAt"
              header="Created At"
              body={imageBodyTemplate}
            />
            <Column field="MAD" header="MAD" />
            <Column field="SSD" header="SSD" />
            {visibleColumns.map((col) => (
              <Column key={col.field} field={col.field} header={col.header} />
            ))}
          </DataTable>
        </Card>
      </div>
    </>
  );
}
