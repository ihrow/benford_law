"use client";
import { Calendar } from "primereact/calendar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { BTCPriceDB, BenfordDistribution } from "../types";
import { Chart } from "primereact/chart";
import { Dropdown } from "primereact/dropdown";
import { Card } from "primereact/card";
import { Toast } from "primereact/toast";

import { Skeleton } from "primereact/skeleton";
import LoadingOverlay from "../components/LoadingOverlay";

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
    setLoadingData(true);
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
  return (
    <>
      <Toast />
      <LoadingOverlay isLoading={loadingData} />
      <div className="md:px-8 sm:px-4 px-0 py-4">
        <div className="text-center w-full gradient-text text-xl">
          <h1 className="my-1">Benford&apos;s law</h1>
        </div>
        <div className="flex flex-column sm:flex-row gap-2 py-2">
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
            data={chartData}
            options={chartOptions}
          />
        )}
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
