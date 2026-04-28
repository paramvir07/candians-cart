"use client";

import { useActionState, useState, useEffect } from "react";
import { IFormActionResponse } from "@/types/form";
import { categories } from "@/lib/categories";
import SubsidyListView from "@/components/shared/subsidyList/SubsidyListView";
import { SubsidyItem } from "@/types/admin/subsidyList.types";

interface AdminSubsidyManagerProps {
  initialItems: SubsidyItem[];
  addItemAction: (
    prev: IFormActionResponse,
    fd: FormData,
  ) => Promise<IFormActionResponse>;
  updateItemAction: (
    prev: IFormActionResponse,
    fd: FormData,
  ) => Promise<IFormActionResponse>;
  deleteItemAction: (
    prev: IFormActionResponse,
    fd: FormData,
  ) => Promise<IFormActionResponse>;
}

const emptyState: IFormActionResponse = { success: false, message: "" };

// ─── Small reusable inline form for create / edit ───────────────────────────
function ItemForm({
  action,
  isPending,
  defaultValues,
  onCancel,
  submitLabel,
}: {
  action: (fd: FormData) => void;
  isPending: boolean;
  defaultValues?: { id?: string; name: string; category: string };
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <form action={action} className="px-5 py-5 space-y-4">
      {defaultValues?.id && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label
            htmlFor="name"
            className="block text-xs font-medium text-slate-600"
          >
            Item Name <span className="text-rose-400">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={defaultValues?.name ?? ""}
            placeholder="e.g. Brown Bread 700g"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 transition"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="category"
            className="block text-xs font-medium text-slate-600"
          >
            Category <span className="text-rose-400">*</span>
          </label>
          <select
            id="category"
            name="category"
            required
            defaultValue={defaultValues?.category ?? ""}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 transition appearance-none cursor-pointer"
          >
            <option value="" disabled>
              Select a category…
            </option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="capitalize">
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
        >
          {isPending ? (
            <>
              <svg
                className="w-3.5 h-3.5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Saving…
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
}

// ─── Delete confirmation inline ──────────────────────────────────────────────
function DeleteConfirm({
  item,
  action,
  isPending,
  onCancel,
}: {
  item: SubsidyItem;
  action: (fd: FormData) => void;
  isPending: boolean;
  onCancel: () => void;
}) {
  return (
    <form
      action={action}
      className="flex items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl"
    >
      <input type="hidden" name="id" value={item._id} />
      <svg
        className="w-4 h-4 text-rose-500 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01M12 4a8 8 0 100 16 8 8 0 000-16z"
        />
      </svg>
      <p className="text-sm text-rose-700 flex-1">
        Delete <span className="font-semibold">{item.name}</span>?
      </p>
      <button
        type="button"
        onClick={onCancel}
        className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 disabled:opacity-50 transition"
      >
        {isPending ? (
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        ) : (
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        )}
        Delete
      </button>
    </form>
  );
}

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({ state }: { state: IFormActionResponse }) {
  if (!state.message) return null;
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl text-sm border ${
        state.success
          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
          : "bg-rose-50 border-rose-200 text-rose-700"
      }`}
    >
      {state.success ? (
        <svg
          className="w-4 h-4 mt-0.5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <svg
          className="w-4 h-4 mt-0.5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01M12 4a8 8 0 100 16 8 8 0 000-16z"
          />
        </svg>
      )}
      <span>{state.message}</span>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function AdminSubsidyManager({
  initialItems,
  addItemAction,
  updateItemAction,
  deleteItemAction,
}: AdminSubsidyManagerProps) {
  const [addState, addFormAction, addPending] = useActionState(
    addItemAction,
    emptyState,
  );
  const [updateState, updateFormAction, updatePending] = useActionState(
    updateItemAction,
    emptyState,
  );
  const [deleteState, deleteFormAction, deletePending] = useActionState(
    deleteItemAction,
    emptyState,
  );

  const [items, setItems] = useState<SubsidyItem[]>(initialItems ?? []);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [addFormKey, setAddFormKey] = useState(0);
  const [lastToast, setLastToast] = useState<IFormActionResponse>(emptyState);

  // Sync optimistic state after each action
  useEffect(() => {
    if (addState.success) {
      setLastToast(addState);
      setIsAddOpen(false);
      setAddFormKey((k) => k + 1);
    } else if (addState.message) {
      setLastToast(addState);
    }
  }, [addState]);

  useEffect(() => {
    if (updateState.success) {
      setLastToast(updateState);
      setEditingId(null);
    } else if (updateState.message) {
      setLastToast(updateState);
    }
  }, [updateState]);

  useEffect(() => {
    if (deleteState.success) {
      setLastToast(deleteState);
      setDeletingId(null);
    } else if (deleteState.message) {
      setLastToast(deleteState);
    }
  }, [deleteState]);

  // ── Optimistic handlers ──────────────────────────────────────────────────

  function handleAdd(formData: FormData) {
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    if (name && category) {
      // temp id until revalidation
      setItems((prev) => [
        ...prev,
        { _id: `temp-${Date.now()}`, name, category },
      ]);
    }
    addFormAction(formData);
  }

  function handleUpdate(formData: FormData) {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    setItems((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, name, category } : item,
      ),
    );
    updateFormAction(formData);
  }

  function handleDelete(formData: FormData) {
    const id = formData.get("id") as string;
    setItems((prev) => prev.filter((item) => item._id !== id));
    deleteFormAction(formData);
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Subsidised Items
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage items eligible for subsidy
          </p>
        </div>
        <button
          onClick={() => {
            setIsAddOpen((v) => !v);
            setEditingId(null);
            setDeletingId(null);
          }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm
            ${isAddOpen ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-slate-800 text-white hover:bg-slate-700"}`}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isAddOpen ? "rotate-45" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          {isAddOpen ? "Cancel" : "Add Item"}
        </button>
      </div>

      {/* Toast */}
      <Toast state={lastToast} />

      {/* Add form */}
      {isAddOpen && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="text-sm font-semibold text-slate-700">
              New Subsidy Item
            </h2>
          </div>
          <ItemForm
            key={addFormKey}
            action={handleAdd}
            isPending={addPending}
            onCancel={() => setIsAddOpen(false)}
            submitLabel="Add Item"
          />
        </div>
      )}

      {/* List with edit/delete per row */}
      <SubsidyListView
        items={items}
        renderItemActions={(item) => (
          <div className="flex items-center gap-1 ml-auto flex-shrink-0">
            <button
              onClick={() => {
                setEditingId(
                  editingId === item._id ? null : (item._id ?? null),
                );
                setDeletingId(null);
                setIsAddOpen(false);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition"
              title="Edit"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 0110 16H8v-2a2 2 0 01.586-1.414z"
                />
              </svg>
            </button>
            <button
              onClick={() => {
                setDeletingId(
                  deletingId === item._id ? null : (item._id ?? null),
                );
                setEditingId(null);
                setIsAddOpen(false);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition"
              title="Delete"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        )}
        renderItemExpanded={(item) => {
          if (editingId === item._id) {
            return (
              <div className="mt-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
                  <h3 className="text-xs font-semibold text-slate-600">
                    Edit Item
                  </h3>
                </div>
                <ItemForm
                  action={handleUpdate}
                  isPending={updatePending}
                  defaultValues={{
                    id: item._id,
                    name: item.name,
                    category: item.category,
                  }}
                  onCancel={() => setEditingId(null)}
                  submitLabel="Save Changes"
                />
              </div>
            );
          }
          if (deletingId === item._id) {
            return (
              <div className="mt-2">
                <DeleteConfirm
                  item={item}
                  action={handleDelete}
                  isPending={deletePending}
                  onCancel={() => setDeletingId(null)}
                />
              </div>
            );
          }
          return null;
        }}
      />
    </div>
  );
}
