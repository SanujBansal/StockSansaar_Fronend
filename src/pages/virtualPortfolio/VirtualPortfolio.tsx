import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  InputBase,
  makeStyles,
  MenuItem,
  Paper,
  Snackbar,
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";
import { Delete, Refresh } from "@material-ui/icons";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import SearchIcon from "@material-ui/icons/Search";
import { DataGrid } from "@mui/x-data-grid";
import clsx from "clsx";
import React, { useContext, useEffect } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useHistory } from "react-router";
import { AuthContext } from "../../AuthContext";
import Alert from "../../components/molecules/Alert";
import TransitionsModal from "../../components/molecules/Modal";
import ViewWrapper from "../../components/wrappers/ViewWrapper";
import virtualPortfolioService, {
  VirtualPortfolioEndpointNames,
} from "../../services/virtualPortfolio";
import queryYahooFinance, {
  YahooFinanceEndpointNames,
} from "../../services/yahooFinanceData";

function getNetProfitLoss(params: any) {
  return (
    (parseFloat(params.getValue(params.id, "currentPrice")) -
      parseFloat(params.getValue(params.id, "price"))) *
    parseInt(params.getValue(params.id, "quantity"))
  ).toFixed(2);
}

function getPercentageChange(params: any) {
  return (
    ((parseFloat(params.getValue(params.id, "netChange")) /
      parseFloat(params.getValue(params.id, "price"))) *
      100) /
    parseFloat(params.getValue(params.id, "quantity"))
  ).toFixed(2);
}

const columns = [
  { field: "symbol", headerName: "Symbol", flex: 0.7 },
  { field: "name", headerName: "Company Name", flex: 1 },
  { field: "price", headerName: "Buy Price", flex: 0.8 },
  { field: "currentPrice", headerName: "Current Price", flex: 0.8 },
  {
    field: "netChange",
    headerName: "Profit/Loss",
    flex: 0.8,
    valueGetter: getNetProfitLoss,
  },
  {
    field: "changePercentage",
    headerName: "%Profit/Loss",
    valueGetter: getPercentageChange,
    flex: 0.9,
  },
  { field: "quantity", headerName: "Quantity", flex: 0.7 },
  { field: "date", headerName: "Date Added", flex: 0.8 },
];
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: "2px 4px",
      display: "flex",
      alignItems: "center",
      width: 400,
      zIndex: 5000,
    },
    input: {
      marginLeft: theme.spacing(1),
      flex: 1,
    },
    iconButton: {
      padding: 10,
    },
    divider: {
      height: 28,
      margin: 4,
    },
    quantityInput: {
      width: "3rem",
    },
    selectStockHeader: {
      display: "flex",
      justifyContent: "space-between",
      margin: "1rem 0",
    },
    deleteButton: {},
  })
);

type SnackbarResponse = {
  message: String;
  status: "success" | "error";
};

export default function VirtualPortfolio() {
  const classes = useStyles();
  const history = useHistory();
  const [searchValue, setSearchValue] = React.useState<String>("");
  const [searchResults, setSearchResults] = React.useState<Array<any>>([]);
  const [showSearchResults, setShowSearchResults] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const { auth } = useContext(AuthContext);
  const [open, setOpen] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [portfolios, setPortfolios] = React.useState<Array<any>>([]);
  const [selectedPortfolio, setSelectedPortfolio] = React.useState<any>();
  const [newPortfolioName, setNewPortfolioName] = React.useState("");
  const [openCreatePortfolio, setOpenCreatePortfolio] = React.useState(false);
  const [selectedStocks, setSelectedStocks] = React.useState<Array<any>>([]);
  const [portfolioToDelete, setPortfolioToDelete] = React.useState<String>();
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [snackbarResponse, setSnackbarResponse] =
    React.useState<SnackbarResponse>({ message: "", status: "success" });
  const [portfoliosWithoutPrice, setPortfoliosWithoutPrice] = React.useState<
    Array<any>
  >([]);
  React.useEffect(() => {
    if (searchValue.length > 1) {
      const timeout = setTimeout(() => {
        queryYahooFinance(YahooFinanceEndpointNames.SEARCH, {
          query: searchValue,
          lang: "en",
          region: "in",
        }).then((res) => {
          const filteredData = res.data.ResultSet.Result.filter(
            (entry: any) => entry["exchDisp"] === "Bombay"
          );
          setSearchResults(filteredData);
        });
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [searchValue]);

  const handleSnackbarClose = (event: any, reason: any) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnackbar(false);
  };

  const addCurrentPriceToStocks = async (
    stocksWithoutPrice: any,
    priceFieldName: any = "price"
  ) => {
    const selectedStocksCopy = stocksWithoutPrice?.slice();
    let selectedSymbols = "";
    selectedStocksCopy?.forEach(
      (stock: any) => (selectedSymbols = selectedSymbols + `${stock?.symbol},`)
    );
    const res = await queryYahooFinance(YahooFinanceEndpointNames.QUOTE, {
      region: "IN",
      lang: "en",
      symbols: selectedSymbols,
    });
    selectedStocksCopy?.forEach((element: any, index: number) => {
      element[priceFieldName] =
        res.data.quoteResponse.result[index]["regularMarketPrice"].toString();
    });
    return selectedStocksCopy;
  };

  const addStocks = async () => {
    for (const stock of selectedPortfolio.stocks) {
      if (
        selectedStocks.findIndex(
          (selectedStock) => selectedStock.symbol === stock.symbol
        ) !== -1
      ) {
        return;
      }
    }
    const selectedStocksCopy = await addCurrentPriceToStocks(selectedStocks);
    const payload = {
      portfolioId: selectedPortfolio?._id,
      stocks: [...selectedStocksCopy],
    };

    virtualPortfolioService(
      "POST",
      VirtualPortfolioEndpointNames.ADD_STOCK,
      {},
      payload
    ).then((updatedPortfolio) => {
      setPortfoliosWithoutPrice([
        ...portfoliosWithoutPrice!.filter(
          (portfolio) => portfolio._id !== selectedPortfolio._id
        ),
        updatedPortfolio.data,
      ]);
      setOpen(false);
      setOpenSnackbar(true);
      setSnackbarResponse({
        message: "Stocks Added to the portfolio",
        status: "success",
      });
    });
    setSelectedStocks([]);
    setShowSearchResults(false);
  };

  const modalCloseHandler = () => {
    setOpen(false);
    setOpenCreatePortfolio(false);
    setSelectedStocks([]);
    setSearchValue("");
    setSearchResults([]);
  };

  const handleStockQuantityChange = (index: number, event: any) => {
    var newSelectedStocks = selectedStocks.slice();
    newSelectedStocks[index].quantity = event.target.value;
    setSelectedStocks(newSelectedStocks);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const createPortfolio = async () => {
    setOpenCreatePortfolio(false);
    const stocks = await addCurrentPriceToStocks(selectedStocks);
    virtualPortfolioService(
      "POST",
      VirtualPortfolioEndpointNames.CREATE,
      {},
      {
        name: newPortfolioName,
        user: auth.currentUser?.uid,
        stocks,
      }
    ).then((res) => {
      setPortfoliosWithoutPrice([...portfolios, res.data]);
      setOpenSnackbar(true);
      setSnackbarResponse({
        message: "Portfolio Created Successfully",
        status: "success",
      });
    });
  };
  const handleConfirmDelete = () => {
    setDialogOpen(false);
    virtualPortfolioService(
      "POST",
      VirtualPortfolioEndpointNames.DELETE,
      {},
      {
        id: portfolioToDelete,
      }
    ).then((res: any) => {
      setPortfolios(
        portfolios?.filter(function (portfolio) {
          console.log(res.data);
          return portfolio._id !== res.data._id;
        })
      );
      setOpenSnackbar(true);
      setSnackbarResponse({
        message: "Portfolio Deleted Successfully",
        status: "success",
      });
    });
  };

  const portfolioRefreshHandler = async (
    event: any,
    portfolioToRefresh: any
  ) => {
    event.stopPropagation();
    console.log(portfolioToRefresh.stocks);
    const stocksWithNewPrices = await addCurrentPriceToStocks(
      portfolioToRefresh.stocks
    );
    const updatedPortfolioToRefresh = {
      ...portfolioToRefresh,
      stocks: stocksWithNewPrices,
    };
    setPortfolios([
      ...portfolios.filter(
        (portfolio) => portfolio._id !== portfolioToRefresh._id
      ),
      updatedPortfolioToRefresh,
    ]);
    setOpenSnackbar(true);
    setSnackbarResponse({
      message: "Portfolio Refreshed with Current Prices",
      status: "success",
    });
  };

  const renderSearchComponent = () => (
    <Paper component="form" className={classes.root}>
      <IconButton className={classes.iconButton} aria-label="search">
        <SearchIcon />
      </IconButton>
      <div>
        <InputBase
          className={classes.input}
          placeholder="Search Stocks"
          inputProps={{ "aria-label": "search stocks" }}
          onChange={(e) => {
            setSearchValue(e.target.value);
            if (e.target.value.length > 1) {
              setShowSearchResults(true);
            }
          }}
        />
      </div>
    </Paper>
  );

  const renderSelectedStocks = () => (
    <>
      {selectedStocks.map((stock, index) => (
        <Grid container spacing={1}>
          <Grid item xs={5}>
            {stock.name}
          </Grid>
          <Grid item xs={3}>
            {stock.symbol}
          </Grid>
          <Grid item xs={3}>
            <input
              className={classes.quantityInput}
              onChange={(e) => handleStockQuantityChange(index, e)}
              value={stock.quantity}
            />
          </Grid>
          <Grid item xs={1}>
            <Delete
              onClick={(e) => {
                e.stopPropagation();
                setSelectedStocks([
                  ...selectedStocks.filter(
                    (selectedStock) => selectedStock.symbol !== stock.symbol
                  ),
                ]);
              }}
            />
          </Grid>
        </Grid>
      ))}
    </>
  );

  const renderSearchResults = () => (
    <div>
      {showSearchResults && searchResults.length === 0 ? (
        <MenuItem
          onClick={() => {
            setShowSearchResults(false);
          }}
        >
          No Results Found
        </MenuItem>
      ) : (
        showSearchResults &&
        searchResults.map((result, index) => {
          console.log(result);
          return (
            <MenuItem
              key={index}
              onClick={() => {
                setShowSearchResults(false);
                if (
                  selectedStocks.findIndex(
                    (stock) => stock.symbol === result.symbol
                  ) === -1
                )
                  setSelectedStocks([
                    ...selectedStocks,
                    {
                      symbol: result.symbol,
                      name: result.name,
                      quantity: 0,
                    },
                  ]);
              }}
            >{`${result.name} - ${result.symbol}`}</MenuItem>
          );
        })
      )}
    </div>
  );

  useEffect(() => {
    setLoading(true);
    virtualPortfolioService(
      "GET",
      VirtualPortfolioEndpointNames.GET_PORTFOLIOS
    ).then(async (res: any) => {
      setPortfoliosWithoutPrice(res.data);
      setLoading(false);
    });
    return () => {
      setLoading(true);
      setPortfoliosWithoutPrice([]);
    };
  }, []);

  useEffect(() => {
    const updatePortfoliosWithCurrentPrice = async () => {
      const portfoliosCopy = portfoliosWithoutPrice.slice();
      for (const portfolio of portfoliosCopy) {
        portfolio.stocks = await addCurrentPriceToStocks(
          portfolio.stocks,
          "currentPrice"
        );
      }
      setLoading(false);
      setPortfolios(portfoliosCopy);
    };
    setLoading(true);
    updatePortfoliosWithCurrentPrice();
  }, [portfoliosWithoutPrice]);

  if (loading) {
    return (
      <ViewWrapper>
        <SkeletonTheme baseColor="#202020" highlightColor="#444">
          <Skeleton className="marginY" height={80} width={400} count={1} />
          <Skeleton className="marginY" height={80} count={1} />
          <Skeleton height={40} count={4} />
          <Skeleton className="marginY" height={80} count={1} />
          <Skeleton className="marginY" height={80} count={1} />
        </SkeletonTheme>
      </ViewWrapper>
    );
  }

  return (
    <ViewWrapper
      header={
        <div className={clsx("flex")}>
          <Typography variant="h3">Virtual Portfolio</Typography>
          <Button
            variant="contained"
            onClick={() => setOpenCreatePortfolio(true)}
          >
            Create Portfolio
          </Button>
        </div>
      }
    >
      {portfolios?.map((portfolio, index) => (
        <Accordion key={portfolio._id} defaultExpanded={index === 0}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>{portfolio.name}</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(true);
                setSelectedPortfolio(portfolio);
              }}
            >
              Add Stocks
            </Button>
            <Delete
              onClick={() => {
                setDialogOpen(true);
                setPortfolioToDelete(portfolio._id);
              }}
            />
            <Refresh onClick={(e) => portfolioRefreshHandler(e, portfolio)} />
          </AccordionSummary>
          <AccordionDetails>
            <DataGrid
              classes={{
                cell: "paddingLeft1",
              }}
              rows={portfolio.stocks}
              getRowId={(row: any) => {
                return row.symbol + row.date;
              }}
              onRowClick={(row: any) => {
                history.push(`stock/${row.row.symbol.split(".")[0]}`);
              }}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              disableSelectionOnClick
              autoHeight
            />
          </AccordionDetails>
        </Accordion>
      ))}
      <TransitionsModal
        open={open}
        setOpen={setOpen}
        handleClose={modalCloseHandler}
      >
        {renderSearchComponent()}
        {renderSearchResults()}
        <div>
          <div className={classes.selectStockHeader}>
            <Typography variant="h5" gutterBottom>
              Selected Stocks
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              disabled={selectedStocks.length === 0}
              onClick={addStocks}
            >
              Add Stocks
            </Button>
          </div>
          {renderSelectedStocks()}
        </div>
      </TransitionsModal>

      {/* create stock portfolio */}
      <TransitionsModal
        open={openCreatePortfolio}
        setOpen={setOpenCreatePortfolio}
        handleClose={modalCloseHandler}
      >
        <Typography variant="h4" gutterBottom>
          Create Portfolio
        </Typography>
        <Button variant="contained" color="primary" onClick={createPortfolio}>
          Create
        </Button>
        <TextField
          required
          label="Portfolio Name"
          value={newPortfolioName}
          onChange={(e) => setNewPortfolioName(e.target.value)}
        />
        {renderSearchComponent()}
        {renderSearchResults()}
        <div>
          <div className={classes.selectStockHeader}>
            <Typography variant="h5" gutterBottom>
              Selected Stocks
            </Typography>
          </div>
          {renderSelectedStocks()}
        </div>
      </TransitionsModal>
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Portfolio?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            // color="warning"
            className={classes.deleteButton}
            variant="contained"
            autoFocus
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarResponse.status}>
          {snackbarResponse.message}
        </Alert>
      </Snackbar>
    </ViewWrapper>
  );
}
