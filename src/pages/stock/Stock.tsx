import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Popover,
  TextField,
  useTheme,
} from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import Typography from "@material-ui/core/Typography";
import ArticleIcon from "@material-ui/icons/Description";
import { makeStyles } from "@material-ui/styles";
import React from "react";
import { useHistory, useParams } from "react-router-dom";
import {
  AdvancedRealTimeChart,
  CompanyProfile,
} from "react-ts-tradingview-widgets";
import StockStatistic from "../../components/molecules/StockStatistic";
import ViewWrapper from "../../components/wrappers/ViewWrapper";
import stockStatsReader from "../../readers/yahooStockKeyStats";
import stockSummaryReader from "../../readers/yahooStockSummary";
import queryYahooFinance, {
  YahooFinanceEndpointNames,
} from "../../services/yahooFinanceData";

const useStyles = makeStyles({
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "1rem",
  },
  grid: {
    display: "grid",
    height: "50vh",
    overflowY: "scroll",
    gridTemplateColumns: "repeat(auto-fill, 15rem)",
  },
});
interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}

const ChartWidget = React.memo(({ theme, symbol }: any) => (
  <div className="widget">
    <AdvancedRealTimeChart
      theme={theme.palette.type}
      symbol={`BSE:${symbol}`}
      height={500}
      width={500}
    />
  </div>
));

const DETAILED_ANALYTICS_BUTTON = "Detailed Analytics";

const BuyStockDialog = ({ handleDialogClose, dialogOpen, symbol }: any) => {
  const [buyQuantity, setBuyQuantity] = React.useState(0);
  return (
    <Dialog
      open={dialogOpen}
      onClose={handleDialogClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{"Buy Stock"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Enter Quantity To Buy for {symbol}
        </DialogContentText>
        <TextField
          type="number"
          onChange={(e) => setBuyQuantity(Number(e.target.value))}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose} color="primary">
          Cancel
        </Button>
        <Button
          data-kite={process.env.REACT_APP_KITE_API_KEY}
          data-exchange="NSE"
          data-tradingsymbol={symbol}
          data-transaction_type="BUY"
          data-quantity={buyQuantity}
          data-order_type="MARKET"
          variant="contained"
          autoFocus
        >
          Buy
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function StockPage() {
  const theme = useTheme();
  const history = useHistory();
  const classes = useStyles();
  const { stockName }: any = useParams();
  const [stockSummary, setStockSummary] = React.useState();
  const [keyStatistics, setKeyStatistics] = React.useState();
  const symbol = stockName.toUpperCase();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    queryYahooFinance(
      YahooFinanceEndpointNames.QUOTE_SUMMARY,
      {
        lang: "en",
        modules: "summaryDetail%2CdefaultKeyStatistics",
        region: "IN",
      },
      `${stockName}.NS`
    ).then((result) => {
      const data = result.data.quoteSummary?.result[0];
      setStockSummary(data?.summaryDetail);
      setKeyStatistics(data?.defaultKeyStatistics);
    });
  }, [stockName]);

  React.useEffect(() => {
    const script = document.createElement("script");

    script.src = "https://kite.trade/publisher.js?v=3";
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
  };

  return (
    <ViewWrapper
      header={
        <div className={classes.header}>
          <div className="flex">
            <Typography variant="h3">{symbol}</Typography>
            <ArticleIcon onClick={handleClick} />
          </div>
          <div>
            <Button
              variant="contained"
              color="primary"
              onClick={() => history.push(`${symbol}/detail`)}
            >
              {DETAILED_ANALYTICS_BUTTON}
            </Button>
            {/* <Button
              variant="contained"
              color="secondary"
              data-kite={process.env.REACT_APP_KITE_API_KEY}
              data-exchange="NSE"
              data-tradingsymbol={symbol}
              data-transaction_type="BUY"
              data-quantity="1"
              data-order_type="MARKET"
            >
              Buy
            </Button> */}
          </div>
        </div>
      }
    >
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <CompanyProfile
          colorTheme={theme.palette.type}
          height={400}
          symbol={`BSE:${symbol}`}
        ></CompanyProfile>
      </Popover>
      <Box display="flex">
        <Box
          sx={{
            width: "55%",
          }}
        >
          <ChartWidget theme={theme} symbol={symbol} />
        </Box>
        <Box
          sx={{
            bgcolor: "background.paper",
            width: "45%",
            margin: "1rem",
            borderRadius: "2rem",
          }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="secondary"
            textColor="inherit"
            aria-label="stock data options tab"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Price & Vol." {...a11yProps(0)} />
            <Tab label="Fundamentals" {...a11yProps(1)} />
            <Tab label="Technical" {...a11yProps(2)} />
            <Tab label="Others" {...a11yProps(3)} />
          </Tabs>
          <TabPanel value={value} index={0}>
            <div className={classes.grid}>
              {Object.entries(stockSummaryReader.price).map(([k, v]) => {
                const value = v(stockSummary);
                // @ts-ignore
                return <StockStatistic keys={k} value={value} />;
              })}
            </div>
          </TabPanel>
          <TabPanel value={value} index={1}>
            <div className={classes.grid}>
              {Object.entries(stockStatsReader.fundamentals).map(([k, v]) => {
                const value = v(keyStatistics);
                // @ts-ignore
                return <StockStatistic keys={k} value={value} />;
              })}
            </div>
          </TabPanel>
          <TabPanel value={value} index={2}>
            <div className={classes.grid}>
              {Object.entries(stockSummaryReader.technicals).map(([k, v]) => {
                const value = v(stockSummary);
                // @ts-ignore
                return <StockStatistic keys={k} value={value} />;
              })}
            </div>
          </TabPanel>
          <TabPanel value={value} index={3}>
            <div className={classes.grid}>
              {Object.entries(stockStatsReader.others).map(([k, v]) => {
                const value = v(keyStatistics);
                // @ts-ignore
                return <StockStatistic keys={k} value={value} />;
              })}
            </div>
          </TabPanel>
        </Box>
      </Box>
      <BuyStockDialog
        dialogOpen={dialogOpen}
        handleDialogClose={() => {
          setDialogOpen(false);
        }}
        symbol={symbol}
      />
    </ViewWrapper>
  );
}
