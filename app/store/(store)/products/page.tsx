'use client'
import GetProducts from '@/components/store/products/GetProducts';
import StoreSidebar from "@/components/store/StoreSidebar";
import ProductHeader from '@/components/store/products/Header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {CirclePlus} from 'lucide-react'

const products = () => {
  return (
      <div>
        
        {/* Header goes at the top of the content area */}
        <header className="border-b p-6">
          <ProductHeader />
        </header>

        <main className="p-6 space-y-6">
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border">
            <p className="text-sm font-medium text-slate-600">
              Want to add a new product?
            </p>
            <Button asChild>
              <Link href="/store/products/add" className="flex items-center gap-2">
                <CirclePlus className="h-4 w-4" />
                Add product
              </Link>
            </Button>
          </div>

          <GetProducts />
        </main>
      </div>
  )
}

export default products