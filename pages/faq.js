import { useState } from 'react';
import { Container, Typography, Box, Accordion, AccordionSummary, AccordionDetails, Paper, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useRouter } from 'next/router';

export default function FAQ({ walletAddress, connectWallet, loading }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const faqItems = [
    {
      id: 'panel1',
      question: 'What is EZ Trade?',
      answer: 'EZ Trade is a open source decentralized platform that allows users to trade digital items directly with each other using cryptocurrency on the Base blockchain, without intermediaries.'
    },
    {
      id: 'panel2',
      question: 'Why users should trade on EZ Trade?',
      answer: 'Nowaday most of the p2p trading protocols took so much trading fees,mostly they took over 5% as trading fees.But at EZ Trade we are offering you a better trading experience without any trading fees.'
    },
    {
      id: 'panel3',
      question: 'What is buy order and how it is work?',
      answer: 'Buy order are just post.When you wanna buy a item you have to post a buy order on the marketplace and then wait for someone to sell the item you want.If someone wanna sell they will talk to you at your telegram.'
    },
    {
      id: 'panel4',
      question: 'How do I buy an item?',
      answer: 'Browse the marketplace and click on an item you\'re interested in. On the item details page,first talk with seller to make sure that seller have enough supply and seller is ready to sell the item,then click the "Purchase" button and confirm the transaction in your wallet.After that seller will send the item to you.Then you have to confirm(by clicking on confirm Delivery) that you got the item.'
    },
    {
      id: 'panel5',
      question: 'What is a Buy Order?',
      answer: 'A Buy Order is when you list what you want to buy on the marketplace. Other users can see your Buy Order and fulfill it by selling you the item you\'re looking for.'
    },
    {
      id: 'panel6',
      question: 'Are there any fees for using the marketplace?',
      answer: 'Yes,we took alittle bit fees to filter spam.User have to pay 0.0002 $ETH to list a sell order and 0.00005 $ETH for a buy order.And only if dispute occur there will be service fees 1-5$ base on situation.This fee goes to support the maintenance and development of the platform.'
    },
    {
      id: 'panel7',
      question: 'I deposit $ETH to smart contract,but deal was cancelled so can I get refund?',
      answer: 'If the deal was cancelled after $ETH deposited to contract both buyer and seller have to report about this to  https://t.me/zeroxwayne .After seller confirmed that they did not transfer the item to buyer then buyer can get refund.However buyer have to pay service fees from 1$ to 5$ depending on the situation and the listing item of seller will be deleted.'
    },
    {
      id: 'panel8',
      question: 'I transfered the item but buyer did not click on confirmed button,how can I get $ETH from contract?',
      answer: 'Seller have to show proof(at https://t.me/zeroxwayne) that seller sent the item to buyer,after that seller will get $ETH.There will be service fees from 1$ to 5$ depending on the situation.'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Button variant="outlined" onClick={() => router.push('/')} sx={{ mb: 2 }}>
        Back to Home
      </Button>

      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Frequently Asked Questions
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Before using the marketplace please read through these FAQs to understand the platform better.
        </Typography>
      </Paper>

      <Box sx={{ mb: 4 }}>
        {faqItems.map((item) => (
          <Accordion 
            key={item.id} 
            expanded={expanded === item.id} 
            onChange={handleChange(item.id)}
            sx={{
              mb: 2,
              borderRadius: '12px',
              overflow: 'hidden',
              '&:before': {
                display: 'none',
              },
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              background: 'linear-gradient(145deg, #1e1e1e, #252525)',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`${item.id}-content`}
              id={`${item.id}-header`}
              sx={{
                borderRadius: '12px',
                '&.Mui-expanded': {
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                },
                background: 'rgba(58, 134, 255, 0.05)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {item.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3, pt: 2 }}>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {item.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          textAlign: 'center',
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(58, 134, 255, 0.05) 0%, rgba(0, 245, 160, 0.05) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <Typography variant="h6" gutterBottom>
          Still have questions?
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Feel free to contact https://t.me/zeroxwayne ,if you have any question or to get support.
        </Typography>
      </Paper>
    </Container>
  );
}