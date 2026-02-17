import { Calendar, BarChart3, ShoppingBag } from "lucide-react";

const OrderHeader = () => {
  // We define our data structure here to make the UI easy to update
  const stats = [
    {
      label: "Daily Orders",
      value: "2",
      subtext: "Today",
      icon: Calendar,
      // Specific styling for the Blue card
      styles: {
        bg: "bg-blue-50",
        border: "border-blue-100",
        text: "text-blue-600",
        subtext: "text-blue-400", // or slate-500 depending on preference
        iconBg: "bg-blue-100" // optional if you want a circle behind icon
      }
    },
    {
      label: "Monthly Orders",
      value: "150",
      subtext: "This month",
      icon: BarChart3,
      // Specific styling for the Green card
      styles: {
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        text: "text-emerald-600",
        subtext: "text-emerald-400",
        iconBg: "bg-emerald-100"
      }
    },
    {
      label: "Total Orders",
      value: "3,450",
      subtext: "All time",
      icon: ShoppingBag,
      // Specific styling for the Orange card
      styles: {
        bg: "bg-orange-50",
        border: "border-orange-100",
        text: "text-orange-600",
        subtext: "text-orange-400",
        iconBg: "bg-orange-100"
      }
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <div 
            key={index} 
            className={`${stat.styles.bg} border ${stat.styles.border} rounded-xl p-6 shadow-sm transition-all hover:shadow-md`}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <p className={`text-sm font-medium ${stat.styles.text}`}>
                  {stat.label}
                </p>
                
                <div className="space-y-1">
                  <h3 className={`text-3xl font-bold ${stat.styles.text}`}>
                    {stat.value}
                  </h3>
                  <p className={`text-xs ${stat.styles.subtext} font-medium`}>
                    {stat.subtext}
                  </p>
                </div>
              </div>

              {/* Icon Container */}
              <div className={`p-2 rounded-lg ${stat.styles.bg}`}> 
                {/* Note: In your image the icon doesn't have a bg, but often it looks nice. 
                    If you want exact match to image, remove the p-2 and bg class above. */}
                <Icon className={`w-5 h-5 ${stat.styles.text}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderHeader;