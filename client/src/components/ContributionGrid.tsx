import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

export default function ContributionGrid() {
  const { user } = useAuth();
  
  // Get contribution data for the last year
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);

  const { data: contributionData = [] } = useQuery({
    queryKey: ["/api/habit-logs/contribution", {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }],
    enabled: !!user,
  });

  // Generate 371 squares (53 weeks * 7 days + a few extra)
  const generateSquares = () => {
    const squares = [];
    const today = new Date();
    
    // Count habits completed by date
    const contributionMap = new Map();
    contributionData.forEach((log: any) => {
      const date = log.date;
      contributionMap.set(date, (contributionMap.get(date) || 0) + 1);
    });

    for (let i = 370; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = contributionMap.get(dateStr) || 0;
      let level = 0;
      if (count > 0) level = 1;
      if (count >= 3) level = 2;
      if (count >= 5) level = 3;
      if (count >= 8) level = 4;

      squares.push(
        <div
          key={i}
          className={`contribution-square level-${level}`}
          title={`${count} habits completed on ${date.toLocaleDateString()}`}
          data-testid={`contribution-square-${dateStr}`}
        />
      );
    }
    
    return squares;
  };

  return (
    <div className="space-y-3">
      {/* Month labels */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Jan</span>
        <span>Feb</span>
        <span>Mar</span>
        <span>Apr</span>
        <span>May</span>
        <span>Jun</span>
        <span>Jul</span>
        <span>Aug</span>
        <span>Sep</span>
        <span>Oct</span>
        <span>Nov</span>
        <span>Dec</span>
      </div>
      
      {/* Contribution squares grid */}
      <div className="grid grid-cols-53 gap-1" data-testid="contribution-grid">
        {generateSquares()}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">Less</span>
          <div className="flex space-x-1">
            <div className="contribution-square level-0"></div>
            <div className="contribution-square level-1"></div>
            <div className="contribution-square level-2"></div>
            <div className="contribution-square level-3"></div>
            <div className="contribution-square level-4"></div>
          </div>
          <span className="text-xs text-muted-foreground">More</span>
        </div>
        <span className="text-xs text-muted-foreground" data-testid="text-total-habits">
          {contributionData.length} habits completed this year
        </span>
      </div>
    </div>
  );
}
