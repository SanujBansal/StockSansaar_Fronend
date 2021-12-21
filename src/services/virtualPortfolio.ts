import axios, { AxiosRequestConfig } from "axios";
import { BASE_URL } from "../constants/appConstants";

export enum VirtualPortfolioEndpointNames {
  CREATE = "createPortfolio",
  ADD_STOCK = "addStock",
  GET_PORTFOLIOS = "getPortfolios",
  REMOVE_STOCK = "removeStock",
  GET_PORTFOLIO_BY_ID = "getPortfolioById",
  DELETE = "delete",
}

const getEndpointUrl = (name: VirtualPortfolioEndpointNames) => {
  switch (name) {
    case VirtualPortfolioEndpointNames.CREATE:
      return "/virtual_portfolio/create";
    case VirtualPortfolioEndpointNames.ADD_STOCK:
      return "/virtual_portfolio/add-stock";
    case VirtualPortfolioEndpointNames.GET_PORTFOLIO_BY_ID:
      return "/virtual_portfolio/get-portfolio-by-id";
    case VirtualPortfolioEndpointNames.GET_PORTFOLIOS:
      return "/virtual_portfolio/get-portfolio";
    case VirtualPortfolioEndpointNames.REMOVE_STOCK:
      return "/virtual_portfolio/remove-stock";
    case VirtualPortfolioEndpointNames.DELETE:
      return "/virtual_portfolio/delete";
    default:
      return "";
  }
};

const virtualPortfolioService = (
  method: "GET" | "POST" | "PUT" | "DELETE",
  endpointName: VirtualPortfolioEndpointNames,
  params: any = {},
  data: any = {}
) => {
  const options: AxiosRequestConfig = {
    method,
    url: `${BASE_URL}${getEndpointUrl(endpointName)}`,
    params,
    data,
  };
  return axios.request(options);
};

export default virtualPortfolioService;
