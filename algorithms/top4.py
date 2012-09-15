# Nick LaGrow
# Fall 2012

import random

#this algorithm is a slightly modififed QuickSelect

# randomized algorithm, O(n) for each call (expected)
def nth_highest(a_list, n):
  # pick a pivot at random from the list
  pivot = a_list[random.randint(0, len(a_list)-1)]
  left = list()
  right = list()

  def compare_pivot(x):
    if (x == pivot):
      return
    if (x < pivot):
      left.append(x)
    else:
      right.append(x)

  # insert each value in the list into LEFT or RIGHT
  # depending on whether it's <,> than the pivot
  map(compare_pivot, a_list)

  # return if there are n-1 greater elements (pivot is nth greatest)
  # otherwise recurse
  if(len(right) == n-1):
    return pivot
  else:
    if(len(right) > n-1):
      return nth_highest(right, n)
    else:
      return nth_highest(left, n - len(right) - 1)

def four_highest(a_list):
  n = len(a_list)
  if (n > 4):
    n = 4

  mod = ["st","nd","rd","th"]
  for i in range(1,5):
    print i,mod[min(i,4)-1],"highest: ",nth_highest(a_list, i)
