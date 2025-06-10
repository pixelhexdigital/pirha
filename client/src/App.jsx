// import moment from "moment";
// import { useEffect } from "react";
import { useSelector } from "react-redux";

import { useGetEnumValuesQuery } from "api/miscApi";
import Cart from "components/Cart";
import MyRoutes from "routes/Router";
import { selectIsEnumValuesLoaded } from "store/MiscellaneousSlice";

function App() {
  const isEnumValuesLoaded = useSelector(selectIsEnumValuesLoaded);
  // const currentTime = moment();
  // const lastFetchTimeKey = "enumValuesLastFetchTime";

  // Get the last fetch time from local storage to check if we need to refetch the data
  // const lastFetchTime = localStorage.getItem(lastFetchTimeKey);

  // const shouldFetch =
  //   !lastFetchTime ||
  //   currentTime.diff(moment(Number(lastFetchTime)), "days") >= 1;

  const { refetch } = useGetEnumValuesQuery(undefined, {
    skip: isEnumValuesLoaded,
  });

  // useEffect(() => {
  //   if (shouldFetch) {
  //     // Refetch the data and update the last fetch time in local storage
  //     refetch();
  //     localStorage.setItem(lastFetchTimeKey, currentTime.valueOf());
  //   }
  // }, [shouldFetch, refetch, currentTime]);

  return (
    <>
      <MyRoutes />
      <Cart />
    </>
  );
}

export default App;
