import { useState, useEffect } from "react";
import axios from "axios";

export const useGenerationCost = (selectedModel, formValues) => {
  const [generationCost, setGenerationCost] = useState(null);
  const [isRefreshingCost, setIsRefreshingCost] = useState(false);

  useEffect(() => {
    if (!selectedModel?.id || selectedModel.id.includes("passthrough")) {
      setGenerationCost(null);
      return;
    }

    const delayDebounce = setTimeout(() => {
      setIsRefreshingCost(true);
      axios.post("/api/app/calculate_dynamic_cost", {
        task_name: selectedModel.id,
        payload: formValues
      })
      .then((response) => {
        setGenerationCost(response.data.cost);
        setIsRefreshingCost(false);
      })
      .catch((error) => {
        if (process.env.NODE_ENV !== "production") {
          const status = error?.response?.status;
          const detail = error?.response?.data?.detail || error?.message;
          console.debug("生成成本暂不可用", { status, detail });
        }
        setGenerationCost(null);
        setIsRefreshingCost(false);
      });
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [selectedModel?.id, formValues]);

  return { generationCost, isRefreshingCost };
};
