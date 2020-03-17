const randomBackground = () => {
  const backgroundArr = [
    'https://trello-attachments.s3.amazonaws.com/5ddd73d4ed01324d8520aa48/5e14916b8bb7433edd98fe0d/4d8d18a558d7aa62854ec4f34d329d83/community_pattern_bg_%233_%E2%80%93_3.png',
    'https://trello-attachments.s3.amazonaws.com/5ddd73d4ed01324d8520aa48/5e14916b8bb7433edd98fe0d/74df73727221b08a8ae0671e8fb7b765/community_pattern_bg_%233_%E2%80%93_4.png',
    'https://trello-attachments.s3.amazonaws.com/5ddd73d4ed01324d8520aa48/5e14916b8bb7433edd98fe0d/2c8fca514d35a105a320f4b69d0864c2/community_pattern_bg_%233.png',
    'https://trello-attachments.s3.amazonaws.com/5ddd73d4ed01324d8520aa48/5e14916b8bb7433edd98fe0d/c302628e5306ba0af5468b7d9525b7d0/community_pattern_bg_%234.png',
  ];
  return backgroundArr[Math.floor(Math.random() * backgroundArr.length)];
};

export default randomBackground;
