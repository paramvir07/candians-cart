"use client";

import { Mail, Phone, MapPin, CreditCard, Star, Building2 } from "lucide-react";
import type { StoreProfile } from "@/actions/admin/analytics/store/getStoreDetail.action";

interface StoreProfileHeaderProps {
  profile: StoreProfile;
}

export default function StoreProfileHeader({
  profile,
}: StoreProfileHeaderProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Top gradient band */}
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />

      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          {/* Avatar + name + rating */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center shrink-0 shadow-sm ring-2 ring-white">
              <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
            </div>

            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                {profile.name}
              </h1>
              {profile.description && (
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                  {profile.description}
                </p>
              )}
              {/* Static rating — replace with real data when available */}
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4].map((i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                    />
                  ))}
                  <Star className="w-3.5 h-3.5 fill-amber-200 text-amber-300" />
                </div>
                <span className="text-xs font-semibold text-amber-600">
                  4.5
                </span>
                <span className="text-xs text-gray-400">(223 Reviews)</span>
              </div>
            </div>
          </div>

          {/* Contact details grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-1 gap-y-2 gap-x-6 text-sm shrink-0 sm:text-right">
            <div className="flex items-center sm:justify-end gap-2 text-gray-500">
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate max-w-[240px] sm:max-w-[280px]">
                {profile.address}
              </span>
            </div>
            <div className="flex items-center sm:justify-end gap-2 text-gray-500">
              <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{profile.mobile}</span>
            </div>
            <div className="flex items-center sm:justify-end gap-2 text-gray-500">
              <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate max-w-[240px]">{profile.email}</span>
            </div>
            <div className="flex items-center sm:justify-end gap-2 text-gray-500">
              <CreditCard className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="text-gray-600 font-medium">
                Credit cycle: 30 days
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
