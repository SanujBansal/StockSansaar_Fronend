import { Button, Grid, makeStyles, Typography } from "@material-ui/core";
import React from "react";
import { useHistory } from "react-router";
import ViewWrapper from "../components/wrappers/ViewWrapper";

const useStyles = makeStyles({
  image: {
    borderRadius: "3rem",
    marginTop: "4rem",
  },
  itemComtainer: {
    display: "flex",
    justifyContent: "center",
  },
  goToSection: {
    display: "flex",
    margin: "auto",
  },
  itemText: {
    padding: "1rem 0",
  },
  linkText: {
    color: "red",
  },
});
const homepageData = [
  {
    title: "Strategies",
    image: "/images/strategy.jpg",
    text: (
      <div>
        The Strategies are formulated and created by experts in the field. These
        strategy indices are&nbsp;
        <a
          className="linkText"
          href="https://www.nseindia.com/products-services/indices-strategy"
        >
          available here.
        </a>
        &nbsp;Choose your strategy from the strategies that have worked in the
        past, analyse your stocks using the data and choose the right stock
      </div>
    ),
    redirectPage: "/strategies",
  },
  {
    title: "Virtual Portfolio",
    image: "/images/stockPortfolio.jpg",
    text: "Market does not give free chances, but our virtual portfolio does. You can add stock to the vitual portfolio and analyse stocks based upon your judgement. Monitor how your stocks are doing before actually investing the money.",
    redirectPage: "/virtual-portfolio",
  },
  {
    title: "Screener",
    image: "/images/findStock.jpg",
    text: "Create you own strategy by observe whats happening in the markets. Top gainers, Top losers, stocks performing technically or fundamentally, all of this data is available for you to filter stocks based upon your needs. If you already have your own strategy, this might be actually the right place to find stocks who follows your strategy.",
    redirectPage: "/screener",
  },
];
export default function HomePage() {
  const classes = useStyles();
  const history = useHistory();
  return (
    <ViewWrapper>
      {homepageData.map((homepageItem, index) => (
        <Grid
          key={index}
          container
          direction={index % 2 ? "row-reverse" : "row"}
          spacing={10}
          className={classes.itemComtainer}
        >
          <Grid item xs={5}>
            {
              <img
                src={homepageItem.image}
                height="250"
                alt="Strategies"
                className={classes.image}
              />
            }
          </Grid>
          <Grid item xs={5}>
            <Typography variant="h3" align="center">
              {homepageItem.title}
            </Typography>
            <Typography className={classes.itemText}>
              {homepageItem.text}
            </Typography>
            <Button
              className={classes.goToSection}
              variant="contained"
              color="secondary"
              onClick={() => history.push(homepageItem.redirectPage || "")}
            >
              Go To {homepageItem.title}
            </Button>
          </Grid>
        </Grid>
      ))}
    </ViewWrapper>
  );
}
