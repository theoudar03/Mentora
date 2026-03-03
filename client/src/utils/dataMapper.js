export const timeAgo = (dateString) => {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  
  if (diffInMs < 0) return "Just now";
  
  const diffInSecs = Math.floor(diffInMs / 1000);
  if (diffInSecs < 60) return `${diffInSecs} secs ago`;
  
  const diffInMins = Math.floor(diffInSecs / 60);
  if (diffInMins < 60) return `${diffInMins} mins ago`;
  
  const diffInHrs = Math.floor(diffInMins / 60);
  if (diffInHrs < 24) return `${diffInHrs} hrs ago`;
  
  const diffInDays = Math.floor(diffInHrs / 24);
  return `${diffInDays} days ago`;
};

export const mapMentorDashboardData = (data) => {
  return {
    ...data,
    students: data.students ? data.students.map(s => ({
      ...s,
      lastCheckIn: timeAgo(s.lastCheckIn)
    })) : [],
    alerts: data.alerts ? data.alerts.map(a => ({
      ...a,
      timestamp: timeAgo(a.timestamp)
    })) : []
  };
};
