import { useState, useEffect } from 'react';

const useAverages = () => {
  const [averages, setAverages] = useState<{
    cumulative: {
      PA: string;
      AB: string;
      H: string;
      BB: string;
      HBP: string;
      SF: string;
      TB: string;
      K: string;
      RBI: string;
      HR: string;
    };
    derived: {
      AVG: string;
      OPS: string;
      OBP: string;
      SLG: string;
      ISO: string;
    };
  } | null>(null);

  useEffect(() => {
    const formatValue = (value: number) => {
      if (value < 1) {
        return value.toLocaleString(undefined, {
          minimumFractionDigits: 3,
          maximumFractionDigits: 3,
        }).replace(/^0+/, '');
      }
      return value.toLocaleString(undefined, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });
    };

    const averages2023Data = {
      cumulative: {
        PA: formatValue(610.2),
        AB: formatValue(543.1),
        H: formatValue(142.5),
        BB: formatValue(55.0),
        HBP: formatValue(6.9),
        SF: formatValue(4.3),
        TB: formatValue(242.1),
        K: formatValue(126.2),
        RBI: formatValue(75.5),
        HR: formatValue(21.8),
      },
      derived: {
        AVG: formatValue(0.262),
        OPS: formatValue(0.781),
        OBP: formatValue(0.336),
        SLG: formatValue(0.444),
        ISO: formatValue(0.183),
      },
    };

    setAverages(averages2023Data);
  }, []);

  return averages;
};

export default useAverages;

