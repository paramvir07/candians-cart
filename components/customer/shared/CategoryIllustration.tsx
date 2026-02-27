// components/customer/shared/CategoryIllustration.tsx

export type GroceryCategory = string;

interface CategoryIllustrationProps {
  category: GroceryCategory;
  className?: string;
}

const normalize = (cat: string) => cat.toLowerCase().trim();

export const CategoryIllustration = ({
  category,
  className = "w-full h-full",
}: CategoryIllustrationProps) => {
  const cat = normalize(category);

  // ── Fruits ──────────────────────────────────────────────────────────────────
  if (cat === "fruits") {
    return (
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <radialGradient id="bg-fruits" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff7ed" />
            <stop offset="100%" stopColor="#fef3c7" />
          </radialGradient>
        </defs>
        <rect width="200" height="200" fill="url(#bg-fruits)" />
        <path
          d="M100 50 Q135 55 148 90 Q155 115 135 138 Q115 158 90 152 Q62 144 58 115 Q52 82 75 62 Q85 53 100 50Z"
          fill="#f59e0b"
        />
        <path
          d="M100 50 Q128 58 138 90 Q143 112 126 132 Q110 150 88 145 Q68 138 65 112 Q60 85 80 66 Q90 55 100 50Z"
          fill="#fbbf24"
        />
        <ellipse
          cx="106"
          cy="95"
          rx="22"
          ry="30"
          fill="#fde68a"
          opacity="0.4"
        />
        <path
          d="M100 50 Q102 35 108 28"
          stroke="#15803d"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <ellipse
          cx="112"
          cy="24"
          rx="9"
          ry="6"
          fill="#16a34a"
          transform="rotate(-20 112 24)"
        />
        <path
          d="M148 128 Q165 118 168 135 Q165 150 150 148 Q140 140 148 128Z"
          fill="#fde047"
        />
        <path
          d="M148 128 Q153 122 160 126"
          stroke="#ca8a04"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="58" cy="148" r="16" fill="#a16207" />
        <circle cx="55" cy="145" r="6" fill="#ca8a04" opacity="0.4" />
        <circle cx="155" cy="68" r="18" fill="#dc2626" />
        <path d="M148 54 L152 46 L157 54" fill="#15803d" />
        <circle cx="150" cy="65" r="3" fill="#fca5a5" opacity="0.6" />
        <circle cx="158" cy="72" r="3" fill="#fca5a5" opacity="0.6" />
        <circle cx="152" cy="74" r="2.5" fill="#fca5a5" opacity="0.6" />
      </svg>
    );
  }

  // ── Vegetables ───────────────────────────────────────────────────────────────
  if (cat === "vegetables") {
    return (
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <radialGradient id="bg-veg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f0fdf4" />
            <stop offset="100%" stopColor="#dcfce7" />
          </radialGradient>
        </defs>
        <rect width="200" height="200" fill="url(#bg-veg)" />
        <path
          d="M85 75 Q105 65 118 85 Q128 102 120 122 Q112 140 95 143 Q75 144 66 126 Q56 106 68 88 Q74 78 85 75Z"
          fill="#7c3aed"
        />
        <path
          d="M90 75 Q108 68 118 85 Q126 100 119 118 Q112 134 96 138 Q79 139 71 123 Q63 105 74 90 Q80 79 90 75Z"
          fill="#8b5cf6"
        />
        <ellipse
          cx="100"
          cy="105"
          rx="14"
          ry="22"
          fill="#a78bfa"
          opacity="0.35"
        />
        <path
          d="M95 75 Q93 60 98 52"
          stroke="#15803d"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <ellipse
          cx="103"
          cy="48"
          rx="12"
          ry="7"
          fill="#16a34a"
          transform="rotate(15 103 48)"
        />
        <path
          d="M138 60 L130 105"
          stroke="#15803d"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M138 60 Q143 54 148 51"
          stroke="#166534"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M138 60 Q133 52 131 47"
          stroke="#166534"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="55" cy="138" r="20" fill="#ef4444" />
        <circle cx="51" cy="134" r="7" fill="#f87171" opacity="0.4" />
        <path
          d="M50 118 Q55 110 60 118"
          stroke="#15803d"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M55 118 Q58 108 63 112"
          stroke="#15803d"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <ellipse
          cx="155"
          cy="145"
          rx="14"
          ry="8"
          fill="#86efac"
          transform="rotate(-30 155 145)"
          opacity="0.8"
        />
        <ellipse
          cx="165"
          cy="138"
          rx="12"
          ry="7"
          fill="#4ade80"
          transform="rotate(20 165 138)"
          opacity="0.8"
        />
        <path
          d="M158 148 L162 130"
          stroke="#15803d"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    );
  }

  // ── Dairy ────────────────────────────────────────────────────────────────────
  if (cat === "dairy") {
    return (
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <radialGradient id="bg-dairy" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="100%" stopColor="#fef3c7" />
          </radialGradient>
        </defs>
        <rect width="200" height="200" fill="url(#bg-dairy)" />
        <rect
          x="60"
          y="72"
          width="52"
          height="78"
          rx="5"
          fill="#f8fafc"
          stroke="#e2e8f0"
          strokeWidth="1.5"
        />
        <path
          d="M60 72 L86 52 L112 72"
          fill="#dbeafe"
          stroke="#93c5fd"
          strokeWidth="1.5"
        />
        <rect x="65" y="102" width="42" height="28" rx="4" fill="#bfdbfe" />
        <path
          d="M72 114 Q86 108 100 114"
          stroke="#3b82f6"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="86" cy="120" r="5" fill="#3b82f6" opacity="0.5" />
        <path
          d="M125 105 L122 158 Q122 165 142 165 Q162 165 162 158 L158 105 Z"
          fill="#fef9c3"
          stroke="#fde047"
          strokeWidth="1.5"
        />
        <ellipse
          cx="141"
          cy="105"
          rx="18"
          ry="5"
          fill="#fef9c3"
          stroke="#fde047"
          strokeWidth="1.5"
        />
        <path
          d="M128 120 Q141 115 155 120"
          stroke="#ca8a04"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M127 130 Q141 124 155 130"
          stroke="#ca8a04"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.4"
        />
        <rect
          x="52"
          y="158"
          width="48"
          height="24"
          rx="4"
          fill="#fef9c3"
          stroke="#fde047"
          strokeWidth="1.5"
        />
        <rect
          x="58"
          y="162"
          width="12"
          height="6"
          rx="1"
          fill="#fbbf24"
          opacity="0.3"
        />
        <rect
          x="76"
          y="162"
          width="12"
          height="6"
          rx="1"
          fill="#fbbf24"
          opacity="0.3"
        />
        <rect
          x="58"
          y="172"
          width="12"
          height="6"
          rx="1"
          fill="#fbbf24"
          opacity="0.3"
        />
        <rect
          x="76"
          y="172"
          width="12"
          height="6"
          rx="1"
          fill="#fbbf24"
          opacity="0.3"
        />
      </svg>
    );
  }

  // ── Meat ─────────────────────────────────────────────────────────────────────
  if (cat === "meat") {
    return (
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <radialGradient id="bg-meat" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff1f2" />
            <stop offset="100%" stopColor="#ffe4e6" />
          </radialGradient>
        </defs>
        <rect width="200" height="200" fill="url(#bg-meat)" />
        <path
          d="M65 110 Q70 80 100 75 Q130 78 140 100 Q150 122 138 140 Q122 158 95 155 Q65 150 58 130 Q54 118 65 110Z"
          fill="#fbbf24"
        />
        <path
          d="M72 112 Q77 88 100 85 Q122 88 130 106 Q137 122 128 136 Q115 150 93 148 Q68 143 64 126 Q62 118 72 112Z"
          fill="#fcd34d"
        />
        <ellipse
          cx="100"
          cy="115"
          rx="20"
          ry="25"
          fill="#fde68a"
          opacity="0.4"
        />
        <path
          d="M65 128 L42 148"
          stroke="#f59e0b"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <circle
          cx="38"
          cy="152"
          r="8"
          fill="#fbbf24"
          stroke="#f59e0b"
          strokeWidth="2"
        />
        <path
          d="M138 128 L158 148"
          stroke="#f59e0b"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <circle
          cx="162"
          cy="152"
          r="8"
          fill="#fbbf24"
          stroke="#f59e0b"
          strokeWidth="2"
        />
        <circle cx="92" cy="108" r="2.5" fill="#92400e" opacity="0.5" />
        <circle cx="108" cy="112" r="2" fill="#dc2626" opacity="0.4" />
        <circle cx="100" cy="120" r="2" fill="#92400e" opacity="0.5" />
        <path d="M52 72 Q72 62 90 72 Q72 82 52 72Z" fill="#60a5fa" />
        <path d="M90 72 L104 62 L104 82Z" fill="#3b82f6" />
        <circle cx="62" cy="71" r="2.5" fill="#1d4ed8" />
      </svg>
    );
  }

  // ── Bakery ───────────────────────────────────────────────────────────────────
  if (cat === "bakery") {
    return (
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <radialGradient id="bg-bake" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff7ed" />
            <stop offset="100%" stopColor="#ffedd5" />
          </radialGradient>
        </defs>
        <rect width="200" height="200" fill="url(#bg-bake)" />
        <ellipse
          cx="95"
          cy="155"
          rx="50"
          ry="12"
          fill="#d97706"
          opacity="0.3"
        />
        <ellipse cx="95" cy="148" rx="50" ry="12" fill="#f59e0b" />
        <ellipse
          cx="95"
          cy="148"
          rx="50"
          ry="12"
          stroke="#d97706"
          strokeWidth="1"
        />
        <ellipse cx="95" cy="139" rx="50" ry="12" fill="#fbbf24" />
        <ellipse
          cx="95"
          cy="139"
          rx="50"
          ry="12"
          stroke="#f59e0b"
          strokeWidth="1"
        />
        <ellipse cx="95" cy="130" rx="50" ry="12" fill="#fcd34d" />
        <ellipse
          cx="95"
          cy="130"
          rx="50"
          ry="12"
          stroke="#fbbf24"
          strokeWidth="1"
        />
        <ellipse
          cx="80"
          cy="128"
          rx="5"
          ry="3"
          fill="#92400e"
          opacity="0.25"
          transform="rotate(-15 80 128)"
        />
        <ellipse
          cx="105"
          cy="126"
          rx="4"
          ry="2.5"
          fill="#92400e"
          opacity="0.2"
          transform="rotate(10 105 126)"
        />
        <ellipse cx="115" cy="132" rx="4" ry="2" fill="#92400e" opacity="0.2" />
        <path
          d="M130 90 Q130 65 155 65 Q180 65 180 90 L180 105 Q180 112 155 112 Q130 112 130 105Z"
          fill="#fbbf24"
        />
        <path d="M133 88 Q133 68 155 68 Q177 68 177 88" fill="#fcd34d" />
        <path
          d="M142 80 Q155 76 168 80"
          stroke="#d97706"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.5"
        />
        <rect
          x="38"
          y="72"
          width="52"
          height="34"
          rx="8"
          fill="#fde68a"
          stroke="#fbbf24"
          strokeWidth="1.5"
        />
        <circle cx="52" cy="82" r="3" fill="#f59e0b" opacity="0.5" />
        <circle cx="64" cy="82" r="3" fill="#f59e0b" opacity="0.5" />
        <circle cx="76" cy="82" r="3" fill="#f59e0b" opacity="0.5" />
        <circle cx="52" cy="94" r="3" fill="#f59e0b" opacity="0.5" />
        <circle cx="64" cy="94" r="3" fill="#f59e0b" opacity="0.5" />
        <circle cx="76" cy="94" r="3" fill="#f59e0b" opacity="0.5" />
      </svg>
    );
  }

  // ── Beverages ─────────────────────────────────────────────────────────────────
  if (cat === "beverages") {
    return (
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <radialGradient id="bg-bev" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="100%" stopColor="#fef3c7" />
          </radialGradient>
        </defs>
        <rect width="200" height="200" fill="url(#bg-bev)" />
        <path
          d="M72 75 L78 158 Q78 165 95 165 Q112 165 112 158 L118 75 Z"
          fill="#fde68a"
        />
        <path
          d="M72 75 L78 148 Q78 155 95 155 Q112 155 112 148 L118 75 Z"
          fill="#f59e0b"
          opacity="0.5"
        />
        <path
          d="M75 105 L79 155 Q79 162 95 162 Q111 162 111 155 L115 105 Z"
          fill="#92400e"
          opacity="0.6"
        />
        <ellipse cx="95" cy="105" rx="22" ry="5" fill="#fef9c3" />
        <path
          d="M118 90 Q132 90 132 105 Q132 120 118 120"
          stroke="#f59e0b"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
        <ellipse cx="95" cy="167" rx="32" ry="7" fill="#fbbf24" opacity="0.5" />
        <ellipse cx="152" cy="105" rx="28" ry="35" fill="#6b7280" />
        <ellipse cx="152" cy="75" rx="14" ry="6" fill="#4b5563" />
        <path
          d="M145 90 Q152 84 159 90"
          stroke="#9ca3af"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <rect x="160" y="65" width="5" height="55" rx="2.5" fill="#f472b6" />
        <path
          d="M82 68 Q85 58 82 50"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M95 65 Q98 55 95 47"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M108 68 Q111 58 108 50"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
      </svg>
    );
  }

  // ── Snacks ────────────────────────────────────────────────────────────────────
  if (cat === "snacks") {
    return (
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <radialGradient id="bg-snack" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff7ed" />
            <stop offset="100%" stopColor="#ffedd5" />
          </radialGradient>
        </defs>
        <rect width="200" height="200" fill="url(#bg-snack)" />
        <path d="M95 50 L148 145 L42 145 Z" fill="#f59e0b" />
        <path
          d="M95 50 L148 145 L42 145 Z"
          fill="none"
          stroke="#d97706"
          strokeWidth="2"
        />
        <path d="M95 50 L120 97 L70 97 Z" fill="#fbbf24" opacity="0.6" />
        <path
          d="M95 50 L95 145"
          stroke="#d97706"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          opacity="0.5"
        />
        <path
          d="M95 98 Q118 105 148 145"
          stroke="#d97706"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          opacity="0.4"
        />
        <circle cx="155" cy="88" r="12" fill="#16a34a" />
        <circle cx="152" cy="86" r="5" fill="#22c55e" opacity="0.5" />
        <circle cx="158" cy="100" r="10" fill="#dc2626" />
        <circle cx="156" cy="98" r="4" fill="#f87171" opacity="0.4" />
        <rect
          x="40"
          y="155"
          width="18"
          height="5"
          rx="2.5"
          fill="#f59e0b"
          transform="rotate(20 49 157)"
        />
        <rect
          x="60"
          y="158"
          width="14"
          height="4"
          rx="2"
          fill="#fbbf24"
          transform="rotate(-15 67 160)"
        />
        <rect
          x="110"
          y="153"
          width="16"
          height="5"
          rx="2.5"
          fill="#f59e0b"
          transform="rotate(10 118 155)"
        />
        <rect
          x="130"
          y="157"
          width="12"
          height="4"
          rx="2"
          fill="#fbbf24"
          transform="rotate(-20 136 159)"
        />
      </svg>
    );
  }

  // ── Household ─────────────────────────────────────────────────────────────────
  if (cat === "household") {
    return (
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <radialGradient id="bg-house" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#eff6ff" />
            <stop offset="100%" stopColor="#dbeafe" />
          </radialGradient>
        </defs>
        <rect width="200" height="200" fill="url(#bg-house)" />
        <rect x="48" y="80" width="56" height="72" rx="6" fill="#3b82f6" />
        <rect
          x="48"
          y="80"
          width="56"
          height="72"
          rx="6"
          stroke="#2563eb"
          strokeWidth="1.5"
        />
        <rect x="54" y="90" width="44" height="28" rx="4" fill="#dbeafe" />
        <circle cx="76" cy="104" r="10" fill="#2563eb" opacity="0.3" />
        <path
          d="M68 104 L84 104 M76 96 L76 112"
          stroke="#1d4ed8"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <rect
          x="54"
          y="125"
          width="44"
          height="18"
          rx="3"
          fill="#93c5fd"
          opacity="0.4"
        />
        <rect x="116" y="90" width="48" height="28" rx="8" fill="#f0abfc" />
        <rect
          x="116"
          y="90"
          width="48"
          height="28"
          rx="8"
          stroke="#e879f9"
          strokeWidth="1.5"
        />
        <ellipse
          cx="140"
          cy="104"
          rx="14"
          ry="8"
          fill="#e879f9"
          opacity="0.3"
        />
        <path
          d="M128 104 Q140 99 152 104"
          stroke="#a21caf"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        <rect
          x="148"
          y="128"
          width="6"
          height="55"
          rx="3"
          fill="#92400e"
          transform="rotate(8 151 155)"
        />
        <path d="M148 168 Q155 160 168 165 Q160 175 148 175 Z" fill="#fbbf24" />
        <path
          d="M148 168 Q154 162 162 162"
          stroke="#d97706"
          strokeWidth="1.5"
          fill="none"
        />
        <circle cx="52" cy="70" r="5" fill="#bfdbfe" opacity="0.7" />
        <circle cx="62" cy="62" r="4" fill="#93c5fd" opacity="0.6" />
        <circle cx="73" cy="68" r="3" fill="#bfdbfe" opacity="0.5" />
      </svg>
    );
  }

  // ── Personal Care ─────────────────────────────────────────────────────────────
  if (cat === "personal care") {
    return (
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <radialGradient id="bg-care" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fdf4ff" />
            <stop offset="100%" stopColor="#fae8ff" />
          </radialGradient>
        </defs>
        <rect width="200" height="200" fill="url(#bg-care)" />
        <rect
          x="62"
          y="85"
          width="42"
          height="72"
          rx="8"
          fill="#fef9c3"
          stroke="#fde047"
          strokeWidth="1.5"
        />
        <rect x="68" y="74" width="30" height="14" rx="7" fill="#ca8a04" />
        <rect x="74" y="68" width="18" height="10" rx="4" fill="#a16207" />
        <rect
          x="67"
          y="100"
          width="42"
          height="20"
          rx="3"
          fill="#fbbf24"
          opacity="0.4"
        />
        <path
          d="M72 108 Q83 103 98 108"
          stroke="#ca8a04"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M70 115 Q83 110 100 115"
          stroke="#ca8a04"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          opacity="0.5"
        />
        <rect
          x="118"
          y="75"
          width="48"
          height="14"
          rx="4"
          fill="#c084fc"
          stroke="#a855f7"
          strokeWidth="1.5"
        />
        <rect x="122" y="89" width="4" height="16" rx="2" fill="#a855f7" />
        <rect x="129" y="89" width="4" height="16" rx="2" fill="#a855f7" />
        <rect x="136" y="89" width="4" height="16" rx="2" fill="#a855f7" />
        <rect x="143" y="89" width="4" height="16" rx="2" fill="#a855f7" />
        <rect x="150" y="89" width="4" height="16" rx="2" fill="#a855f7" />
        <rect x="157" y="89" width="4" height="16" rx="2" fill="#a855f7" />
        <circle
          cx="142"
          cy="130"
          r="22"
          fill="#fecaca"
          stroke="#fca5a5"
          strokeWidth="1.5"
        />
        <circle cx="142" cy="130" r="14" fill="#dc2626" opacity="0.8" />
        <circle cx="139" cy="127" r="5" fill="#ef4444" opacity="0.5" />
        <ellipse
          cx="58"
          cy="158"
          rx="10"
          ry="6"
          fill="#fda4af"
          transform="rotate(-30 58 158)"
          opacity="0.8"
        />
        <ellipse
          cx="68"
          cy="165"
          rx="9"
          ry="5"
          fill="#f9a8d4"
          transform="rotate(15 68 165)"
          opacity="0.8"
        />
        <ellipse
          cx="48"
          cy="165"
          rx="8"
          ry="5"
          fill="#fda4af"
          transform="rotate(-50 48 165)"
          opacity="0.7"
        />
      </svg>
    );
  }

  // ── Other ─────────────────────────────────────────────────────────────────────
  if (cat === "other") {
    return (
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <radialGradient id="bg-other" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#f1f5f9" />
          </radialGradient>
        </defs>
        <rect width="200" height="200" fill="url(#bg-other)" />
        <path
          d="M55 100 L58 162 Q58 170 100 170 Q142 170 142 162 L145 100 Z"
          fill="#d97706"
        />
        <path
          d="M55 100 L142 100"
          stroke="#b45309"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M60 108 L140 108"
          stroke="#b45309"
          strokeWidth="1.5"
          opacity="0.4"
        />
        <path
          d="M60 120 L140 120"
          stroke="#b45309"
          strokeWidth="1.5"
          opacity="0.4"
        />
        <path
          d="M60 132 L140 132"
          stroke="#b45309"
          strokeWidth="1.5"
          opacity="0.4"
        />
        <path
          d="M60 144 L140 144"
          stroke="#b45309"
          strokeWidth="1.5"
          opacity="0.4"
        />
        <path
          d="M60 156 L140 156"
          stroke="#b45309"
          strokeWidth="1.5"
          opacity="0.4"
        />
        <path
          d="M75 100 Q75 72 100 72 Q125 72 125 100"
          stroke="#92400e"
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="82" cy="96" r="8" fill="#ef4444" opacity="0.9" />
        <ellipse cx="100" cy="94" rx="10" ry="8" fill="#16a34a" opacity="0.9" />
        <circle cx="118" cy="96" r="8" fill="#f59e0b" opacity="0.9" />
      </svg>
    );
  }

  // Generic fallback
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <radialGradient id="bg-generic" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#f1f5f9" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill="url(#bg-generic)" />
      <path
        d="M65 90 L75 70 Q100 55 125 70 L135 90 L145 165 Q145 172 100 172 Q55 172 55 165 Z"
        fill="#e2e8f0"
      />
      <path
        d="M65 90 L75 70 Q100 55 125 70 L135 90"
        stroke="#94a3b8"
        strokeWidth="2.5"
        fill="none"
      />
      <rect
        x="85"
        y="60"
        width="30"
        height="20"
        rx="10"
        fill="none"
        stroke="#94a3b8"
        strokeWidth="3"
      />
    </svg>
  );
};

// ─── Category config — used everywhere for colors, emoji, badges ─────────────
export const CATEGORY_CONFIG: Record<
  string,
  { bg: string; text: string; border: string; emoji: string; gradient: string }
> = {
  Fruits: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    emoji: "🥭",
    gradient: "from-amber-400 to-orange-500",
  },
  Vegetables: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    emoji: "🥦",
    gradient: "from-green-400 to-emerald-500",
  },
  Dairy: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
    emoji: "🥛",
    gradient: "from-yellow-300 to-amber-400",
  },
  Meat: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    emoji: "🍗",
    gradient: "from-red-400 to-rose-500",
  },
  Bakery: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    emoji: "🫓",
    gradient: "from-orange-300 to-amber-400",
  },
  Beverages: {
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    border: "border-yellow-300",
    emoji: "☕",
    gradient: "from-yellow-500 to-orange-400",
  },
  Snacks: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    emoji: "🥟",
    gradient: "from-orange-400 to-yellow-400",
  },
  Household: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    emoji: "🧹",
    gradient: "from-blue-400 to-cyan-400",
  },
  "Personal Care": {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    emoji: "🪥",
    gradient: "from-purple-400 to-pink-400",
  },
  Other: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    emoji: "🛒",
    gradient: "from-slate-400 to-slate-500",
  },
};

export const getCategoryConfig = (category: string) =>
  CATEGORY_CONFIG[category] ?? {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    emoji: "🛒",
    gradient: "from-slate-400 to-slate-500",
  };

export const ALL_CATEGORIES = [
  "Fruits",
  "Vegetables",
  "Dairy",
  "Meat",
  "Bakery",
  "Beverages",
  "Snacks",
  "Household",
  "Personal Care",
  "Other",
];
