"use client"
import React, { useState } from "react";
import { Plus, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const AddProductForm = () => {
  // Syncing state with your Mongoose Schema
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    markup: 0,
    tax: 0,
    disposableFee: 0, // in cents
    Price: 0, // in cents
    inStock: true,
    images: []
  });


// 1. Define the interface based on your schema
interface ProductFormData {
  name: string;
  description: string;
  category: string;
  markup: number;
  tax: number;
  disposableFee: number;
  Price: number;
  inStock: boolean;
  images: Array<{ url: string; fileId: string }>;
}

// 2. Apply types to the parameters
const handlePriceChange = (val: string, field: keyof ProductFormData) => {
  // We convert the string input to a float, then to cents (integer)
  const cents = Math.round(parseFloat(val) * 100) || 0;
  
  setFormData((prev) => ({
    ...prev,
    [field]: cents,
  }));
};

  return (
    <div className="max-w-6xl mx-auto p-8 bg-[#F9FAFB] min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Add Product</h1>
        <Button variant="outline" className="bg-white border-slate-200 shadow-sm px-6">
          Cancel
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-slate-200">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-lg font-semibold">Basic Information</h2>

              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Organic Whole Milk" 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-white" 
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  placeholder="Describe the product features..." 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="min-h-40 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Availability</Label>
                  <Select onValueChange={(val) => setFormData({...formData, inStock: val === "true"})}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">In Stock</SelectItem>
                      <SelectItem value="false">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Base Price (CAD)</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    onChange={(e) => handlePriceChange(e.target.value, 'Price')}
                    className="bg-white" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm ring-1 ring-slate-200">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-lg font-semibold">Financials & Fees</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Markup (%)</Label>
                  <Input 
                    type="number" 
                    placeholder="30" 
                    onChange={(e) => setFormData({...formData, markup: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tax Rate</Label>
                  <Select onValueChange={(val) => setFormData({...formData, tax: Number(val)})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Tax" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.00">No Tax (0%)</SelectItem>
                      <SelectItem value="0.05">GST (5%)</SelectItem>
                      <SelectItem value="0.07">PST (7%)</SelectItem>
                      <SelectItem value="0.12">GST+PST (12%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Disposable Fee (CAD)</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.10" 
                    onChange={(e) => handlePriceChange(e.target.value, 'disposableFee')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Media & Category */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-slate-200">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Images</h2>
              <div className="border-2 border-dashed border-slate-100 rounded-xl p-6 flex flex-col items-center text-center bg-white">
                <ImageIcon className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-[10px] text-slate-400 mb-4">PNG, JPG up to 10MB</p>
                <Button variant="secondary" size="sm" className="w-full bg-indigo-50 text-indigo-600">
                  Upload Image
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square rounded border border-slate-100 bg-white flex items-center justify-center">
                    <Plus className="h-4 w-4 text-indigo-500 opacity-50" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm ring-1 ring-slate-200">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Classification</h2>
              <div className="space-y-2">
                <Label className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Category</Label>
                <Select onValueChange={(val) => setFormData({...formData, category: val})}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Fruits", "Vegetables", "Dairy", "Meat", "Bakery", "Beverages", "Snacks", "Household", "Personal Care", "Other"].map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={() => console.log("Submitting to API:", formData)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 text-base font-semibold shadow-lg shadow-indigo-100"
          >
            Save Product
          </Button>
        </div>

      </div>
    </div>
  );
};

export default AddProductForm;