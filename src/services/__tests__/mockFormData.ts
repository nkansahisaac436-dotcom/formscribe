/**
 * Mock FB_PUBLIC_LOAD_DATA_ snippet representing a multi-section Google Form
 */
export const mockPublicLoadData = [
  null,
  [
    'This is the form description header.',
    [
      // Question 1: Short answer (type 0), required
      [
        1001,
        'What is your full name?',
        'Enter first and last name',
        0,
        [[2001, null, 1]],
      ],
      // Question 2: Paragraph (type 1), optional
      [
        1002,
        'Provide your background and feedback',
        '',
        1,
        [[2002, null, 0]],
      ],
      // Question 3: Multiple choice (type 2) with jump logic and Other option
      [
        1003,
        'Select your preferred department',
        'Choose one option',
        2,
        [
          [
            2003,
            [
              ['Engineering', null, 2, null, 0],
              ['Marketing', null, 3, null, 0],
              ['', null, null, null, 1], // Other option
            ],
            1, // Required
          ],
        ],
      ],
      // Question 4: Linear scale (type 5)
      [
        1004,
        'Rate your overall experience',
        '',
        5,
        [
          [
            2004,
            [['1', null, null, null, 0], ['5', null, null, null, 0]],
            1,
            [1, 5],
            ['Very Poor', 'Excellent'],
          ],
        ],
      ],
      // Item 5: Page break (type 8) -> Starts Page 2
      [
        1005,
        'Section 2: Contact Information',
        'Please provide additional details',
        8,
        [[2005, 'Section 2 description']],
      ],
      // Question 6: Checkboxes (type 4) on Page 2
      [
        1006,
        'Which devices do you own?',
        'Select all that apply',
        4,
        [
          [
            2006,
            [
              ['Smartphone', null, null, null, 0],
              ['Laptop', null, null, null, 0],
              ['Tablet', null, null, null, 0],
            ],
            0,
          ],
        ],
      ],
      // Question 7: Dropdown (type 3)
      [
        1007,
        'Select your Country',
        '',
        3,
        [
          [
            2007,
            [
              ['United States', null, null, null, 0],
              ['United Kingdom', null, null, null, 0],
              ['Ghana', null, null, null, 0],
            ],
            1,
          ],
        ],
      ],
      // Question 8: Date (type 9)
      [
        1008,
        'Select Date of Birth',
        '',
        9,
        [[2008, null, 0]],
      ],
      // Question 9: Time (type 10)
      [
        1009,
        'Preferred Appointment Time',
        '',
        10,
        [[2009, null, 0]],
      ],
      // Item 10: Section header / title block (type 6)
      [
        1010,
        'Office Notes Block',
        'Important instructions for staff',
        6,
        null,
      ],
    ],
    null,
    null,
    null,
    null,
    null,
    null,
    'Sample Comprehensive Survey Form',
  ],
  null,
  'Sample Comprehensive Survey Form',
];
