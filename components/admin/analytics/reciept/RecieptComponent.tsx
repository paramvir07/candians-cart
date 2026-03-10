"use client";

import { useState, useEffect } from "react";
import { type DateRange } from "react-day-picker";
import {
  getRecieptDataByDateRange,
  AggregatedReciept,
} from "@/actions/admin/reciept/generateReciept";
import {
  getStores,
  GetStoresResponse,
} from "@/actions/store/getStores.actions";
import { StoreDocument } from "@/types/store/store"; // Using existing types
import { DownloadButton } from "./DownloadButton";
import { DatePickerWithRange } from "./DatePickerWithRange";

// Shadcn UI Imports
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RecieptComponent() {
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  // Strictly typed state for receipts
  const [receipts, setReceipts] = useState<AggregatedReciept[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Strictly typed state for stores list
  const [stores, setStores] = useState<StoreDocument[]>([]);
  const [storeId, setStoreId] = useState<string>("all");
  const [isStoresLoading, setIsStoresLoading] = useState(true);

  useEffect(() => {
    async function fetchStores() {
      try {
        // Use the explicit response type from your action
        const response: GetStoresResponse = await getStores();
        if (response.success) {
          setStores(response.data);
        } else {
          console.error("Failed to load stores:", response.error);
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
      } finally {
        setIsStoresLoading(false);
      }
    }
    fetchStores();
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (date?.from && date?.to) {
        setIsLoading(true);

        const startDate = new Date(date.from);
        startDate.setUTCHours(0, 0, 0, 0);

        const endDate = new Date(date.to);
        endDate.setUTCHours(23, 59, 59, 999);

        const selectedStore = storeId === "all" ? undefined : storeId;

        try {
          const data = await getRecieptDataByDateRange({
            startDate,
            endDate,
            storeId: selectedStore,
          });

          setReceipts(data);
        } catch (error) {
          console.error("Failed to fetch receipt data:", error);
          setReceipts(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setReceipts(null);
      }
    }

    fetchData();
  }, [date, storeId]);

  const hasData = receipts && receipts.length > 0;
  const fromIso = date?.from ? date.from.toISOString() : "";
  const toIso = date?.to ? date.to.toISOString() : "";

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "monospace",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <h1
        style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}
      >
        Platform Settlement Generator
      </h1>

      <div
        style={{
          marginBottom: "30px",
          display: "flex",
          gap: "20px",
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <Field className="w-60">
          <FieldLabel>Select Store</FieldLabel>
          <Select
            disabled={isStoresLoading}
            value={storeId}
            onValueChange={setStoreId}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  isStoresLoading ? "Loading stores..." : "Select a store"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stores (Global)</SelectItem>
              {stores.map((store) => (
                // Using strictly typed fields from StoreDocument
                <SelectItem
                  key={store._id.toString()}
                  value={store._id.toString()}
                >
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <DatePickerWithRange date={date} setDate={setDate} />
      </div>

      {isLoading && (
        <div style={{ marginBottom: "20px", color: "#666" }}>
          Calculating totals...
        </div>
      )}

      {hasData && date?.from && date?.to && !isLoading ? (
        <>
          <DownloadButton
            storeId={storeId === "all" ? "" : storeId}
            startDateIso={fromIso}
            endDateIso={toIso}
          />

          <div style={{ marginTop: "20px" }}>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              {storeId === "all"
                ? "Platform-wide Aggregation"
                : "Store-specific Data"}
              :
            </h2>
            <pre
              style={{
                background: "#1e1e1e",
                color: "#d4d4d4",
                padding: "15px",
                borderRadius: "8px",
                overflowX: "auto",
              }}
            >
              {JSON.stringify(receipts, null, 2)}
            </pre>
          </div>
        </>
      ) : !isLoading && date?.from && date?.to ? (
        <div
          style={{
            padding: "30px",
            background: "#f8f9fa",
            border: "1px dashed #ccc",
            borderRadius: "8px",
            textAlign: "center",
            color: "#666",
          }}
        >
          No completed orders found for this selection.
        </div>
      ) : !isLoading ? (
        <div
          style={{
            padding: "30px",
            background: "#f8f9fa",
            border: "1px dashed #ccc",
            borderRadius: "8px",
            textAlign: "center",
            color: "#666",
          }}
        >
          Please select a date range to generate settlement data.
        </div>
      ) : null}
    </div>
  );
}
