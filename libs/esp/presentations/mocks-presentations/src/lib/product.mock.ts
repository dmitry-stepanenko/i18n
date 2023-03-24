import { Product, ProductSearchResultItem } from '@smartlink/models';

export const MOCK_PRODUCT: Product = {
  Id: 5443047,
  Name: 'product name',
  Number: 'FLWR-E',
  Description: '',
  Categories: [
    {
      Id: 'B08820003',
      Name: 'Bumper Stickers',
    },
    {
      Id: 'D01009003',
      Name: 'Vinyl',
      Parent: {
        Id: 'D01000003',
        Name: 'Decals',
      },
    },
  ],
  ImageUrl: 'media/22624610',
  Supplier: {
    Id: 8691525,
    Name: 'Stickerbeat Inc.',
    AsiNumber: '89771',
    Phone: {
      Primary: '(416) 896-1706',
    },
    Fax: {
      Primary: '(905) 672-3875',
    },
    Email: 'support@stickerbeat.com',
    Websites: [
      'https://www.stickerbeat.com',
      'https://www.facebook.com/stickerbeatinc/',
      'https://twitter.com/stickerbeatinc',
      'https://www.pinterest.ca/stickerbeat0111/',
      'https://www.youtube.com/channel/UCuU05h3IuboshLduWG6ujAg',
      'LinkedIn: http://linkedin.com/company/stickerbeat-inc',
      'https://www.instagram.com/_stickerbeat/',
    ],
    Rating: {
      Rating: 10,
      Companies: 9,
      Transactions: 210,
    },
    MarketingPolicy:
      'Supplier indicates they sell advertising specialties through distributors and/or incentive resellers and to end users through internet/ecommerce',
    IsMinorityOwned: false,
    IsUnionAvailable: false,
  },
  LowestPrice: {
    Quantity: 200,
    Price: 0.53,
    Cost: 0.318,
    DiscountCode: 'R',
    CurrencyCode: 'USD',
    PreferredPrice: 0.25,
  },
  HighestPrice: {
    Quantity: 200,
    Price: 0.53,
    Cost: 0.318,
    DiscountCode: 'R',
    CurrencyCode: 'USD',
    PreferredPrice: 0.25,
  },
  Attributes: {
    Colors: {
      Values: [
        {
          Code: 'UNCL',
          Name: 'Custom',
        },
        {
          Code: 'WHTE',
          Name: 'White',
        },
        {
          Code: 'MEBL',
          Name: 'Blue',
        },
        {
          Code: 'MDBR',
          Name: 'Brown',
        },
        {
          Code: 'MEOG',
          Name: 'Orange',
        },
        {
          Code: 'MEPL',
          Name: 'Purple',
        },
        {
          Code: 'BLCK',
          Name: 'Black',
        },
        {
          Code: 'MEGR',
          Name: 'Gray',
        },
        {
          Code: 'MERD',
          Name: 'Red',
        },
        {
          Code: 'MEYE',
          Name: 'Yellow',
        },
        {
          Code: 'MEGN',
          Name: 'Green',
        },
        {
          Code: 'MEPK',
          Name: 'Pink',
        },
        {
          Code: 'DRBL',
          Name: 'Navy Blue',
        },
        {
          Code: 'FLBL',
          Name: 'Royal Blue',
        },
        {
          Code: 'LIBL',
          Name: 'Light Blue',
        },
        {
          Code: 'MEGN',
          Name: 'Teal',
        },
        {
          Code: 'MEGR',
          Name: 'Silver',
        },
        {
          Code: 'DRYE',
          Name: 'Gold',
        },
        {
          Code: 'DRRD',
          Name: 'Maroon',
        },
        {
          Code: 'DRRD',
          Name: 'Burgundy',
        },
        {
          Code: 'CLER',
          Name: 'Clear',
        },
        {
          Code: 'MLTI',
          Name: 'Multi Color',
        },
      ],
    },
    Sizes: {
      Values: [
        {
          Code: 'NJZM',
          Name: '2 " x 5 "',
        },
        {
          Code: 'NJZM',
          Name: '5 " x 2 "',
        },
        {
          Code: 'JMGE',
          Name: '2 " x 6 "',
        },
        {
          Code: 'JMGE',
          Name: '6 " x 2 "',
        },
        {
          Code: 'NJZM',
          Name: '3 " x 4 "',
        },
        {
          Code: 'NJZM',
          Name: '4 " x 3 "',
        },
        {
          Code: 'NJZM',
          Name: '3 " x 5 "',
        },
        {
          Code: 'NJZM',
          Name: '5 " x 3 "',
        },
        {
          Code: 'JMGE',
          Name: '3 " x 6 "',
        },
        {
          Code: 'JMGE',
          Name: '6 " x 3 "',
        },
        {
          Code: 'NJZM',
          Name: '4 " x 5 "',
        },
        {
          Code: 'NJZM',
          Name: '5 " x 4 "',
        },
        {
          Code: 'JMGE',
          Name: '4 " x 6 "',
        },
        {
          Code: 'JMGE',
          Name: '6 " x 4 "',
        },
        {
          Code: 'NJZM',
          Name: '5 " x 5 "',
        },
        {
          Code: 'NJZM',
          Name: '4 " x 4 "',
        },
        {
          Code: 'NJZM',
          Name: '3 " x 3 "',
        },
        {
          Code: 'NJZM',
          Name: '2 " x 2 "',
        },
      ],
    },
    Materials: {
      Values: [
        {
          Code: '$03M',
          Name: 'Vinyl',
        },
      ],
    },
    Shapes: {
      Values: [
        {
          Code: 'CUST',
          Name: 'Custom Shapes',
        },
        {
          Code: 'CUST',
          Name: 'Any Shape',
        },
        {
          Code: 'ROUN',
          Name: 'Circle',
        },
        {
          Code: 'OVAL',
          Name: 'Oval',
        },
        {
          Code: 'ROUN',
          Name: 'Round',
        },
        {
          Code: 'SQUA',
          Name: 'Square',
        },
        {
          Code: 'TRIA',
          Name: 'Triangle',
        },
      ],
    },
  },
  UpdateDate: '2021-02-09T08:24:41.000-05:00',
  Currencies: ['USD'],
  Currency: 'USD',
};

export const MOCK_PRODUCT_RESULTS: ProductSearchResultItem[] = [
  {
    Id: 7377728,
    ObjectId: '7377728-37570648-5',
    Name: 'Cotton Twill Round Flat Visor "OTTO SNAP" 6Panel Hat (Youth)',
    Description:
      'Make sure your little league team has professional style with this trendy youth baseball cap! This 6-panel cap is made of 100% cotton and is available in a variety of vibrant colors. It features a structured firm front panel, flat visor, and a plastic snap closure. Hand out this trendy item during game days, company retreats, trade shows, and other promotional events. This cap makes a great display for a school, little league, team, club, or business name, logo, mascot, or promotional slogan. Get noticed in no time with this stylish promotional apparel!',
    ShortDescription:
      'Youth 6-panel pro style cap made of 100% cotton with flat visor and plastic snap closure.',
    Number: '145-1044',
    ImageUrl: 'media/20111121',
    Supplier: {
      Id: 2624,
      Name: 'Otto Intl Inc',
      AsiNumber: '75350',
      Rating: {
        Rating: 10,
        Transactions: 4,
        Reports: 4,
      },
      Preferred: {
        Rank: 2,
        Name: 'Gold',
      },
    },
    Price: {
      Id: 37570648,
      Quantity: 1296,
      Price: 6.9,
      Cost: 3.45,
      DiscountCode: 'P',
      CurrencyCode: 'USD',
    },
    IsNew: false,
    IsConfirmed: true,
    HasInventory: false,
    ColorCount: 4,
    Ad: {
      Id: 20020576,
      Position: 0,
      Row: 0,
    },
  },
  {
    Id: 7377717,
    ObjectId: '7377717-37570605-5',
    Name: 'Wool Twill Round Flat Visor "OTTO SNAP" 6 Panel Hat (Youth)',
    Description:
      'Give your little league professional style with this youth baseball cap! This 6-panel pro style cap is made of a wool and acrylic blend with multiple bright and bold colors to choose from. It features a structured firm front, flat visor, and a plastic snap closure. This is a great accessory for kids sports leagues, day camps, school outings, and more. There is plenty of space to show off a team, camp, school, or organization name, mascot, logo, or promotional slogan. Boys and girls will look like professionals hitting the field in this pro style baseball cap!',
    ShortDescription:
      'Youth 6-panel pro style cap made of a wool blend with a flat visor and plastic snap closure.',
    Number: '145-990',
    ImageUrl: 'media/20111124',
    Supplier: {
      Id: 2624,
      Name: 'Otto Intl Inc',
      AsiNumber: '75350',
      Rating: {
        Rating: 10,
        Transactions: 4,
        Reports: 4,
      },
      Preferred: {
        Rank: 2,
        Name: 'Gold',
      },
    },
    Price: {
      Id: 37570605,
      Quantity: 1296,
      Price: 7.2,
      Cost: 3.6,
      DiscountCode: 'P',
      CurrencyCode: 'USD',
    },
    IsNew: false,
    IsConfirmed: true,
    HasInventory: false,
    ColorCount: 4,
    Ad: {
      Id: 20059240,
      Position: 1,
      Row: 0,
    },
  },
  {
    Id: 550757957,
    ObjectId: '550757957-836734786-1',
    Name: 'Sportsman Bucket Cap',
    Description:
      'The Sportsman Bucket Cap is perfect for a day of fishing or even to complete a stylish ensemble. This unstructured hat is made of 100 percent bio-washed chino twill with sewn eyelets and the crown is raised to 3 1/2 inches. This hat comes in multiple colors and is one size fits all. So take your pick! Make this a part of your marketing strategy today and generate the buzz you deserve. This product is sold blank only.',
    ShortDescription: 'Bucket cap',
    Number: '2050',
    ImageUrl: 'media/31309203',
    Supplier: {
      Id: 3112,
      Name: 'S&S Activewear',
      AsiNumber: '84358',
      Rating: {
        Rating: 10,
        Transactions: 9,
        Reports: 9,
      },
      Preferred: {
        Rank: 1,
        Name: 'Platinum',
      },
    },
    Price: {
      Id: 836734786,
      Quantity: 1,
      Price: 8.3,
      Cost: 4.15,
      DiscountCode: 'P',
      CurrencyCode: 'USD',
    },
    IsNew: false,
    IsConfirmed: true,
    HasInventory: false,
    ColorCount: 8,
    Ad: {
      Id: 20061733,
      Position: 2,
      Row: 0,
    },
  },
  {
    Id: 5129167,
    ObjectId: '5129167-36404249-4',
    Name: 'Bouffant Cap',
    Description:
      "Keep hair protected in medical environments with this surgical bouffant cap. Maximize your brand exposure with this go-to garment for medical and dental professionals. This muslin cap features an elastic sewn-in bottom. It's a one-size-fits-all cap that has a large imprint area to show off your logo. Choose from a variety of color options and customize the cap with your company or organization's name, logo, and/or organizational message. Get wrapped up in this custom cap!",
    ShortDescription: 'Muslin surgical cap with elastic sewn-in bottom.',
    Number: 'NC530',
    ImageUrl: 'media/21420021',
    Supplier: {
      Id: 181,
      Name: 'AdCapitol',
      AsiNumber: '31260',
      Rating: {
        Rating: 10,
        Transactions: 1,
        Reports: 1,
      },
      Preferred: {
        Rank: 2,
        Name: 'Gold',
      },
    },
    Price: {
      Id: 36404249,
      Quantity: 1000,
      Price: 4.53,
      Cost: 2.718,
      DiscountCode: 'R',
      CurrencyCode: 'USD',
    },
    IsNew: false,
    IsConfirmed: false,
    HasInventory: false,
    ColorCount: 23,
    Ad: {
      Id: 20043293,
      Position: 3,
      Row: 0,
    },
  },
  {
    Id: 553380462,
    ObjectId: '553380462-847540478-5',
    Name: 'Summer Ponystail Caps',
    Description:
      'The Ponystail Cap is made of washed cotton twill for cool and comfortable wear, with 6 paneled unconstructed and adjustable loop, it is one-size-fits-all cap, available in various colors. Your company Logo can be embroidered on the cap, it can be considered as a good gift for youth group, ball clubs, schools, travel group, and other social or patriotic activities, and so on.',
    ShortDescription:
      'The Ponystail Cap is made of washed cotton twill for cool and comfortable wear',
    Number: 'HR6262',
    ImageUrl: 'media/46357951',
    Supplier: {
      Id: 8879465,
      Name: 'HR Promos Corp',
      AsiNumber: '58774',
    },
    Price: {
      Id: 847540478,
      Quantity: 3000,
      Price: 5.017,
      Cost: 3.01,
      DiscountCode: 'R',
      CurrencyCode: 'USD',
    },
    IsNew: true,
    IsConfirmed: true,
    HasInventory: false,
    ColorCount: 7,
    Ad: {
      Id: 20091779,
      Position: 4,
      Row: 0,
    },
  },
  {
    Id: 553445889,
    ObjectId: '553445889-848231523-6',
    Name: 'Washed Cotton Mask Cap',
    Description:
      'There is no description for the product Washed Cotton Mask Cap',
    ShortDescription:
      'Washed Cotton Mask Cap. 100% Washed Cotton Twill 6 Panel, Low Profile Unstructured Crown & Pre-Curved Visor',
    Number: '15001',
    ImageUrl: 'media/92367367',
    Supplier: {
      Id: 1780,
      Name: 'Hit Promotional Products',
      AsiNumber: '61125',
      Rating: {
        Rating: 9,
        Transactions: 122,
        Reports: 122,
      },
      Preferred: {
        Rank: 1,
        Name: 'Platinum',
      },
    },
    Price: {
      Id: 848231523,
      Quantity: 1008,
      Price: 8.09,
      Cost: 4.854,
      DiscountCode: 'R',
      CurrencyCode: 'USD',
    },
    IsNew: true,
    IsConfirmed: true,
    HasInventory: false,
    ColorCount: 5,
    Ad: {
      Id: 769053,
      Position: 5,
      Row: 0,
    },
  },
  {
    Id: 6860520,
    ObjectId: '6860520-37401650-2',
    Name: "Infinity Selections Ladies' Fashion Toyo Hat",
    Description:
      'Infinity selections ladies fashion toyo hat. Run "circles" around the competition with the Infinity Selections ladies\' fashion toyo hat! Made with 100% polyester, this stylish toyo hat has a 4" brim size and features a beautiful combination of light, metallic, complementary colors plus a bead decoration band. Available in multiple colors, this favor comes in an open size pack per color and is sold blank. One size fits most.',
    ShortDescription: 'Infinity selections ladies fashion toyo hat.',
    Number: '8229',
    ImageUrl: 'media/20625317',
    Supplier: {
      Id: 7623,
      Name: 'Mega Cap Inc',
      AsiNumber: '70434',
    },
    Price: {
      Id: 37401650,
      Quantity: 144,
      Price: 10.57,
      Cost: 6.342,
      DiscountCode: 'R',
      CurrencyCode: 'USD',
    },
    IsNew: false,
    IsConfirmed: true,
    HasInventory: false,
    ColorCount: 2,
    Ad: {
      Id: 449743,
      Position: 6,
      Row: 0,
    },
  },
  {
    Id: 550042621,
    ObjectId: '550042621-833835602-1',
    Name: 'Kishigo Beanie',
    Description:
      'Stay warm and highly visible with this winter donning this brightly colored beanie! Available in lime and orange, each 100% polyester knit cap features two stripes of reflective thread woven into the beanie, allowing for greater flexibility. One size fits most. Bound to be appreciated by any recipient, this gift provides them with a great product and an added level of comfort for their head. This product is sold blank.',
    ShortDescription: 'Beanie with two stripes of reflective thread, blank.',
    Number: '2826-2827',
    ImageUrl: 'media/31303563',
    Supplier: {
      Id: 3112,
      Name: 'S&S Activewear',
      AsiNumber: '84358',
      Rating: {
        Rating: 10,
        Transactions: 9,
        Reports: 9,
      },
      Preferred: {
        Rank: 1,
        Name: 'Platinum',
      },
    },
    Price: {
      Id: 833835602,
      Quantity: 1,
      Price: 15.44,
      Cost: 7.72,
      DiscountCode: 'P',
      CurrencyCode: 'USD',
    },
    IsNew: false,
    IsConfirmed: true,
    HasInventory: false,
    ColorCount: 2,
    Ad: {
      Id: 20061734,
      Position: 7,
      Row: 0,
    },
  },
  {
    Id: 553445889,
    ObjectId: '553445889-848231523-6',
    Name: 'Washed Cotton Mask Cap',
    Description:
      'There is no description for the product Washed Cotton Mask Cap',
    ShortDescription:
      'Washed Cotton Mask Cap. 100% Washed Cotton Twill 6 Panel, Low Profile Unstructured Crown & Pre-Curved Visor',
    Number: '15001',
    ImageUrl: 'media/92367367',
    Supplier: {
      Id: 1780,
      Name: 'Hit Promotional Products',
      AsiNumber: '61125',
      Rating: {
        Rating: 9,
        Transactions: 122,
        Reports: 122,
      },
      Preferred: {
        Rank: 1,
        Name: 'Platinum',
      },
    },
    Price: {
      Id: 848231523,
      Quantity: 1008,
      Price: 8.09,
      Cost: 4.854,
      DiscountCode: 'R',
      CurrencyCode: 'USD',
    },
    IsNew: true,
    IsConfirmed: true,
    HasInventory: false,
    ColorCount: 5,
  },
  {
    Id: 553445888,
    ObjectId: '553445888-848231532-6',
    Name: 'Cotton Twill Mesh Back Mask Cap',
    Description:
      'There is no description for the product Cotton Twill Mesh Back Mask Cap',
    ShortDescription:
      'Cotton Twill Mesh Back Mask Cap. 100% Brushed Cotton Twill Crown 6 Panel, Medium Profile Structured Crown & Pre-Curved Visor',
    Number: '15000',
    ImageUrl: 'media/92457058',
    Supplier: {
      Id: 1780,
      Name: 'Hit Promotional Products',
      AsiNumber: '61125',
      Rating: {
        Rating: 9,
        Transactions: 121,
        Reports: 121,
      },
      Preferred: {
        Rank: 1,
        Name: 'Platinum',
      },
    },
    Price: {
      Id: 848231532,
      Quantity: 1008,
      Price: 7.79,
      Cost: 4.674,
      DiscountCode: 'R',
      CurrencyCode: 'USD',
    },
    IsNew: true,
    IsConfirmed: true,
    HasInventory: false,
    ColorCount: 4,
  },
  {
    Id: 551269123,
    ObjectId: '551269123-832088858-2',
    Name: 'UV Bucket Hat w/Flap',
    Description:
      'This UV Bucket Hat w/Flap has a one of a kind ability to store its UV protective back flap in a stealthy built-in pouch on the underside of the brim. Offering 50+ UV protection, water repellent material, a moisture wicking sweatband, a packable flap and mesh for ventilation, this antibacterial and odor resistant handout is the perfect way to connect with your customers at every event. Use this hat at tradeshows, outdoor events and much more!',
    ShortDescription: 'UV Bucket Hat w/Flap.',
    Number: 'J7211',
    ImageUrl: 'media/25164262',
    Supplier: {
      Id: 7623,
      Name: 'Mega Cap Inc',
      AsiNumber: '70434',
    },
    Price: {
      Id: 832088858,
      Quantity: 144,
      Price: 11.17,
      Cost: 6.702,
      DiscountCode: 'R',
      CurrencyCode: 'USD',
    },
    IsNew: false,
    IsConfirmed: true,
    HasInventory: false,
    ColorCount: 2,
    Ad: {
      Id: 449743,
      Position: 6,
      Row: 1,
    },
  },
  {
    Id: 4890910,
    ObjectId: '4890910-846986308-1',
    Name: 'Rabbit Skins Infant Baby Rib Cap',
    Description:
      'You will be surprised how many compliments your baby receives when they wear the adorable Rabbit Skins Infant Cap! This infant baby rib cap is made with a durable 5.0 oz. 100% combed ringspun cotton 1x1 baby rib. You can have your cap look however you want as it is available in classic colors. One size fits most. Your baby will get all of the attention when styling this cool cap. Blank product.',
    ShortDescription: 'Infant baby rib cap. Blank product.',
    Number: '4451',
    ImageUrl: 'media/32238079',
    Supplier: {
      Id: 3112,
      Name: 'S&S Activewear',
      AsiNumber: '84358',
      Rating: {
        Rating: 10,
        Transactions: 9,
        Reports: 9,
      },
      Preferred: {
        Rank: 1,
        Name: 'Platinum',
      },
    },
    Price: {
      Id: 846986308,
      Quantity: 1,
      Price: 5.74,
      Cost: 2.87,
      DiscountCode: 'P',
      CurrencyCode: 'USD',
    },
    IsNew: false,
    IsConfirmed: true,
    HasInventory: false,
    ColorCount: 19,
    Ad: {
      Id: 20061734,
      Position: 7,
      Row: 1,
    },
  },
  {
    Id: 552302531,
    ObjectId: '552302531-841204523-5',
    Name: 'Foldable Cotton Bucket Hats',
    Description:
      "Promote your Brands Logo with our Aster cotton bucket hat made of lightweight cotton material and it fits right in your customers' pocket to take with them to the beach or sporting events across the region. This Aussie-style gift can be had in limited color options and will fit most everyone in your  for their next vacation. It will block out the sun and maximize your brand exposure at the same time. This unique-looking promotion will be a hit for your next trade show. It'll be a profitable day for your company with this addition!",
    ShortDescription: 'Bucket hat made of lightweight cotton material',
    Number: 'CPFL71US',
    ImageUrl: 'media/35452498',
    Supplier: {
      Id: 5732278,
      Name: 'imprintID',
      AsiNumber: '73651',
      Rating: {
        Rating: 9,
        Transactions: 392,
        Reports: 392,
      },
    },
    Price: {
      Id: 841204523,
      Quantity: 1008,
      Price: 10.19,
      Cost: 6.114,
      DiscountCode: 'R',
      CurrencyCode: 'USD',
    },
    IsNew: false,
    IsConfirmed: true,
    HasInventory: false,
    ColorCount: 3,
  },
  {
    Id: 551848738,
    ObjectId: '551848738-848221198-5',
    Name: 'Jersey Beanie',
    Description:
      'Add this jersey beanie to your marketing campaign to spread the word about your brand to students, athletes and more! Made of 83% cotton/11% polyester/6% spandex, it\'s offered in black and gray and stretches to fit most adult head sizes. It measures approximately 10" W x 8.25" H (flat with folded cuff) and is great for everything from going on a run to extra warmth in the winter. Care instructions: hand wash only, do not bleach, do not tumble dry, do not iron and do not dry clean. Give your brand a new look!',
    ShortDescription:
      'Athletic beanie made of 83% cotton/11% polyester/6% spandex that measures 10" W x 8.25" H and fits most adult heads',
    Number: 'AP113',
    ImageUrl: 'media/35417095',
    Supplier: {
      Id: 2866,
      Name: 'Prime Line',
      AsiNumber: '79530',
      Rating: {
        Rating: 8,
        Transactions: 29,
        Reports: 29,
      },
      Preferred: {
        Rank: 2,
        Name: 'Gold',
      },
    },
    Price: {
      Id: 848221198,
      Quantity: 600,
      Price: 7.49,
      Cost: 4.494,
      DiscountCode: 'R',
      CurrencyCode: 'USD',
    },
    IsNew: false,
    IsConfirmed: true,
    HasInventory: false,
    ColorCount: 2,
  },
];
