import React, { FC, useState } from 'react'
import styled from 'styled-components'
import CardDetails from './CardDetails'
import '../App.css'
import API_URL from '../api_url'
import Account from '../models/Account'

interface OverviewProps{
  accountType:string,
  accountNames:string[]
}

const Overview:FC<OverviewProps> = ({accountType, accountNames}) => {

  const [showForm, setShowForm] = useState<string>('');

  const [transferType, setTransferType] = useState<string>('');
  const [clientPhoneNumber, setClientPhoneNumber] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [clientAccount, setClientAccounts] = useState<Account[]>([]);
  const [transferToAccount, setTransferToAccount] = useState<string>('');
  const [money, setMoney] = useState<string>('');


  function handleFormChange(type:string){
    if(type === 'replenish'){
      if(showForm !== 'replenish'){
        setShowForm('replenish')
      }else{
        setShowForm('');
      }
    }else{
      if(showForm !== 'transfer'){
        setShowForm('transfer')
      }else{
        setShowForm('')
      }  
    }
  }

  function handleTelephoneChange(tel:string){
    const token = sessionStorage.getItem('token')
    const url = `${API_URL}/user/get-user-by-telephone/${tel}`;
    setClientPhoneNumber(tel)
    setTimeout(() => fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `${token}`
      },
    }).then (function (response) {return response.json()})
      .then(function (json) {
        const clientName:string = `${json.firstName} ${json.lastName}`
        setClientName(clientName);
        setClientAccounts(json.accounts);
      })
      .catch(function (error) {console.log(error)}), 1000)
  }

  function handleTransfer(){
    const id = sessionStorage.getItem('id')
    const token = sessionStorage.getItem('token')
    if(transferType === 'Между счетами'){
      const url = `${API_URL}/BankOperation/make-transfer-myaccount`;
      const MakeTransferCommand = {
        userId: id,
        fromAccount: accountType,
        toAccount: transferToAccount,
        transferAmount: money,
        currencyType: 'KZT'
      }
      fetch(url,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(MakeTransferCommand)
      }).then (function (response) {return response.json()})
        .then(function (json) {
          alert(json.message);
          setTransferToAccount('')
          setMoney('')
        })
        .catch(function (error) {console.log(error)})
    }else{
      const MakeTransferCommand = {
        userId: id,
        fromAccount: accountType,
        toAccount: transferToAccount,
        transferAmount: money,
        currencyType: 'KZT'
      }
      // To DO
    }
  }
  return (
    <OverviewWrapper>
      <AccountType>
        {accountType}
      </AccountType>
      <BankOperationButtons>
        <ReplenishButton onClick={()=>handleFormChange('replenish')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-cash" viewBox="0 0 16 16">
          <path d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
          <path d="M0 4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V4zm3 0a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h10a2 2 0 0 1 2-2V6a2 2 0 0 1-2-2H3z"/>
        </svg>
          <span>Пополнить</span>
        </ReplenishButton>
        <TransferButton onClick={()=>handleFormChange('transfer')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-left-right" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M1 11.5a.5.5 0 0 0 .5.5h11.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 11H1.5a.5.5 0 0 0-.5.5zm14-7a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H14.5a.5.5 0 0 1 .5.5z"/>
          </svg>
          <span>Перевод</span>
        </TransferButton>
      </BankOperationButtons>
      <CardDetails />
      <ReplenishForm className={showForm === 'replenish' ? 'showReplenish' : 'hideReplenish'}>
          <div>
            <span>Счет для пополнения: {accountType}</span>
          </div>
          <div>
            Сумма пополнения: <input /> 
            <span>KZT</span>
          </div>
          <button>Пополнить</button>
      </ReplenishForm>
      <TransferForm className={showForm === 'transfer' ? 'showTransfer' : 'hideTransfer'}>
        <div>
          <span>Вид перевода: </span>
          <select onChange={(e) => setTransferType(e.target.value)}>
            <option>Перевод</option>
            <option>Между счетами</option>
            <option>На счет клиента</option>
          </select>
        </div>
        {transferType === 'Между счетами' ?
          <div>
            <span>Счет:</span> 
            <select value={transferToAccount} onChange={e => setTransferToAccount(e.target.value)}>
              <option>Выберите счет</option>
              {accountNames.map((acc, a)=> <option key={a++}>{acc}</option>)}
            </select>
          </div> :
          <div>
            <div>
              <span>Номер клиента:</span>
              <input type='text' value={clientPhoneNumber} onChange={e => handleTelephoneChange(e.target.value)} />
            </div>
            { clientName !== '' ?
            <div>
              <span>{clientName}</span>
              <select value={transferToAccount} onChange={(e) => setTransferToAccount(e.target.value)}>
                <option>Счет клиента</option>
                {clientAccount.map((account, i) => <option key={i++}>{account.accountType}</option>)}
              </select>
            </div> : null}
          </div>    
        }
        <div>
          <span>Сумма перевода: </span>
          <input type='text' className='money__input' value={money} onChange={e => setMoney(e.target.value)}/>
          <span>KZT</span>
        </div>
        <div>
          <button onClick={handleTransfer}>Перевод</button>
        </div>
      </TransferForm>
      
    </OverviewWrapper>

  )
}

export default Overview

const OverviewWrapper = styled.div`
  height:400px;
  margin-left:20px;
  margin-right:20px;
  margin-bottom:20px;
  position:relative;
`

const BankOperationButtons = styled.div`
  position:absolute;
  right:0px;
  top:15px;
`

const ReplenishButton = styled.button`
  margin-right:20px;
  width:150px;
  height:40px;
  border:1px solid #46a062;
  background-color:white;
  color:#46a062;
  position:relative;
  font-weight:600;
  font-size:14px;
  transition:background-color, 0.3s ease-in-out;
  svg{
    margin-right:20px;
    width:20px;
    height:20px;
    position:absolute;
    left:20px;
    top:9px;
  }
  span{
    position:absolute;
    right:25px;
    top:11px;
  }
  :hover{
    cursor:pointer;
    background-color:#edf7f0;
  }
`

const TransferButton = styled.button`
margin-right:20px;
width:150px;
height:40px;
border:1px solid #e65c4d;
background-color:white;
color:#e65c4d;
position:relative;
font-weight:600;
font-size:14px;
transition:background-color, 0.3s ease-in-out;

svg{
  margin-right:20px;
  width:20px;
  height:20px;
  position:absolute;
  left:20px;
  top:9px;
}
span{
  position:absolute;
  right:25px;
  top:11px;
}
:hover{
  cursor:pointer;
  background-color: #fcebe9;
}
`

const AccountType = styled.div`
  color:#666;
  font-size:18px;
  margin-left:10px;
  margin-top:10px;
`

const ReplenishForm = styled.div`
  background-color:white;
  border:1px solid #e3e3e3;
  width:fit-content;
  height:fit-content;
  color:#666;
  font-size:15px;
  padding:20px;
  margin-top:10px;
  div{
    margin-bottom:5px;
  }
  input{
    outline:none;
    border:0;
    border-bottom:1px solid #666;
    width:70px;
  }
  button{
    border:0;
    background-color:#46a062;
    width:100%;
    padding-top:5px;
    padding-bottom:5px;
    padding-right:10px;
    padding-left:10px;
    margin-top:10px;
    color:white;
    cursor:pointer;
  }
`

const TransferForm = styled.div`
  background-color:white;
  border:1px solid #e3e3e3;
  padding-left:20px;
  padding-right:20px;
  padding-top:10px;
  padding-bottom:10px;
  top:34px;
  position:absolute;
  left:10px;
  div{
    font-size:15px;
    margin-bottom:5px;
  }
  span{
    color:#666;
    font-size:15px;
  }
  select{
    outline:none;
    border:0;
    border-bottom:1px solid #666666;
    color:#666666;
    margin-left:10px;
  }
  input{
    width:100px;
    border:0;
    border-bottom:1px solid #666;
    margin-left:10px;
    outline:none;
  }
  .money__input{
    width:70px;
  }
  button{
    width:100%;
    margin-top:10px;
    margin-bottom:-20px;
    border:0;
    background-color:#e65c4d;
    color:white;
    cursor:pointer;
    padding-top:5px;
    padding-bottom:5px;
  }
`