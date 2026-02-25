import React from 'react'
import StoreInfo from '@/components/admin/store/existingStores/GetStore'

const StorePage = () => {
  return (
    <div>
      {/* Show option to add a new store */}

      {/* Existing Stores */}
      <StoreInfo />

      {/* Search bar search for both the product name and the store name */}
    </div>
  )
}

export default StorePage
