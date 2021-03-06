import {Chip, Grid, Stack, Typography} from "@mui/material";
import FaceIcon from "@mui/icons-material/Face";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import {useParams} from "react-router-dom";
import {useWeb3React} from "@web3-react/core";
import {ABI, tokenAddresses} from "../utilities/ABI";
import Web3 from "web3";
import {encrypt} from "../utilities/CryptographicGoodies";
import {BigInteger} from "jsbn";

export function ProposalPage({ daos, proposals }) {
  const { daoId, proposalId } = useParams();
  const { account, active } = useWeb3React();

  const dao = daos.find(e => e.id === daoId);
  const proposal = proposals.find(e => e.id === proposalId);

  const vote = async (vote) => {
    let pk = new BigInteger(proposal.publicKey);
    let web3 = new Web3(window.ethereum);

    const tokenInst = new web3.eth.Contract(ABI, tokenAddresses[0].address);
    const balance = await tokenInst.methods.balanceOf(account).call();
    console.log(balance);

    if (balance!==0) {
      const sign = await window.ethereum.request({
        method: "personal_sign",
        params: ["voted", account, "Vote receipt"],
      });
      console.log(await sign);
      let encryptedVote=await encrypt(vote, new BigInteger(pk));
      console.log(encryptedVote.toString());
    } else {
      alert("You should have tokens to vote");
    }
  };


  // console.log(params);
  // let daoLookUp = daos.find(e => e.id === params.daoId);
  // console.log(daoLookUp);
  let name, id, img_url, description, token_address;
  if (dao !== undefined) {
    name = dao.name;
    id = dao.id;
    img_url = dao.img_url;
    description = dao.description;
    token_address = dao.token_address;
  }
  // const proposalLookup = proposals.find(
  //   e => e.daoId === id && e.id === params.proposalId
  // );
  let pTitleO, pAuthorO, pDateO, pTimeO, pStatusO, pDescriptionO, pFdtO;
  if (proposal !== undefined) {
    const {
      title: pTitle,
      author: pAuthor,
      status: pStatus,
      description: pDescription,
      id: pId,
      date: pDate,
      time: pTime,
    } = proposal;
    pTitleO = pTitle;
    pAuthorO = pAuthor;
    pStatusO = pStatus;
    pDescriptionO = pDescription;
    pFdtO = pDate + pTime;
    pDateO = pDate;
    console.log(new Date(pDate))
  }

  return (
    <Grid container spacing={2} sx={{ml: "-200px"}}>
      <Grid item lg={7.5} xs={12} sx={{ ml: "50px" }}>
        <div>
          <Typography sx={{ fontWeight: 200 }} variant={"h4"}>{pTitleO}</Typography>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            By Author{" "}
            <Chip
              variant="outlined"
              color="primary"
              size="small"
              icon={<FaceIcon />}
              label={pAuthorO}
              component={"span"}
            />
          </Typography>
          <Typography sx={{ mt: 3 }} paragraph>{pDescriptionO}</Typography>
          <Stack
            sx={{ position: "relative", mb: "75px"}}
            direction={"row"}
            spacing={1}
            className={"dao-title-container"}
          >
            {new Date(pDateO) > Date.now() !== undefined && (
              <Chip
                color={pStatusO?.result ? "success" : "error"}
                label={pStatusO?.result ? "Aye" : "Nay"}
                component={"span"}
                sx={{height: "35px", borderRadius: 50}}
              />
            )}
            <Chip
              variant="outlined"
              color={new Date(pDateO) > Date.now() ? "secondary" : "error"}
              size="small"
              icon={<CalendarMonthIcon />}
              label={
                "Voting closes @ " +
                new Date(pDateO).toLocaleDateString()
              }
              component={"span"}
              sx={{height: "35px", px: 1}}
            />
          </Stack>
        </div>
      </Grid>

      <Grid item sx={{ position: "fixed", right: 3, width: "300px", mr: "40px" }}>
        <Card sx={{ display: "flex", backgroundColor: "transparent" }}>
          <Box sx={{ 
            display: "flex", 
            flexDirection: "column",
            borderRadius: 5,
            border: "1px solid white",
            backgroundColor: "background.default",
            paddingX: "8px",
            paddingBottom: "10px",
            width: "600px", 
            }}>
            <CardContent sx={{ flex: "1 0 auto" }}>
              <Typography component="div" variant="h5">
                Cast your vote
              </Typography>
              {new Date(pDateO) > Date.now() ? (
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  component="div"
                >
                  Be careful, this action cannot be undone!
                </Typography>
              ) : (
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  component="div"
                >
                  Voting is no longer available
                </Typography>
              )}
            </CardContent>
            {new Date(pDateO) > Date.now() ? (
              <Box sx={{ display: "flex", alignItems: "center", pl: 1, pb: 1 }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => {
                    vote("1");
                  }}
                >
                  Aye
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => {
                    vote("0");
                  }}
                  sx={{
                    ml: 1.5
                  }}
                >
                  Nay
                </Button>
              </Box>
            ) : null}
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
}
