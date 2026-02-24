

1. SPF Record Setup : 

    SPF (Sender Policy Framework) ensures that only authorized servers can send emails on behalf of your domain.

    1. Log in to your domain hosting provider or DNS management panel.
    2. Locate your DNS settings or DNS Zone Editor.
    3. Add a new TXT record for SPF.
        Host: Domain / @
        Type: TXT
        TTL: 3600
        Value: Create a value using the IPs you provided:
                v=spf1 ip4:85.239.41.111 ip4:85.239.41.129 ip4:85.239.41.37 ip4:85.239.41.101 ip4:85.239.41.27 ip4:85.239.40.215 ~all
    
    4. Save the record.
    5. Check in DNS watch, for you records are visible or not ??


2. For DKIM Records :

    1. Visit : https://easydmarc.com/tools/dkim-record-generator
    2. Fill Domain  : healthpointnewz.com
    3. Selector : default
    4. Key Length : 1024
    5. Click generate
    6. Log in to your domain hosting provider or DNS management panel.
    7. Locate your DNS settings or DNS Zone Editor.
    8. Add a new TXT record for DKIM.
       Host: default._domainkey.healthpointnewz.com
       Type: TXT
       TTL: 3600
       Value: v=DKIM1;k=rsa;t=s;p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDKqyGsmLZVU2vKrDBgd8PvL09dyAy4or1vqJP+7eRv76QegpTwK2VEK0vXaHx7wZTychhFsHKXyjFfPzYEPvTsEx3G/mqYok3Yom9Jhh2MPm461m3Lj3dU9yfMkxMdoplyIAyk4t86J3rNhHfXnb0ug0QWbIcXlPXDyTp6/zrgGwIDAQAB
    9. Save Records
    10. Check in DNS watch, for you records are visible or not ??
    11. Login to PMTA Server
    12. cd /etc/pmta
    13. ll
    14. check if dkim folder present, if not then run below command
         mkdir dkim;chmod 0777 dkim/
    15. After running above command you will find dkim folder created
    16. cd dkim/
    17. Create file in following format : selector.domain.private
         eg: default.healthpointnewz.com.private
    18. vi default.healthpointnewz.com.private
    19. copy private key from https://easydmarc.com/tools/dkim-record-generator
    20. Go to Terminal and press i
    21. Observer you will be in INSERT mode show below.
    22. Paste Key and remove entra spaces.
    23. press esc , observe insert mode will be removed
    24. press :wq , observer down below it will be written
    25. press enter
    26. press ll , you will find a file with key.
    27. run : chmod 0777 *
    28. vi /etc/pmta/config
    29. Scroll down till you find  # DKIM SELECTORS START
    30. Create Reord for PMTA Config as shown below 
        domain-key default,healthpointnewz.com,/etc/pmta/dkim/default.healthpointnewz.com.private
    31. press i
    32. Paste Key and remove entra spaces.
    33. press esc , observe insert mode will be removed
    34. press :wq , observer down below it will be written
    35. press enter
    

3. For DMARC Records :

    1. Log in to your domain hosting provider or DNS management panel.
    2. Locate your DNS settings or DNS Zone Editor. 
    3. Add a new TXT record for DMARC.
        Host: _dmarc
        Type: TXT
        TTL: 3600 seconds.
        Value: Paste below
            v=DMARC1; p=none; rua=mailto:april_s50@yahoo.com; ruf=mailto:april_s50@yahoo.com; sp=none; aspf=r;
       
    4. Save the record.

