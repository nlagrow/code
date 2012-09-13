def print_statistics(a_list):
  mean = median = mode = 0
  a_list.sort()
  occurences = {}

  #find the mean
  mean = reduce(lambda x,y: x+y+0.0, a_list) / len(a_list)
  print "mean: " + str(mean)

  #find the median
  if (len(a_list) % 2 == 1):
    median = a_list[len(a_list) / 2]
  else:
    median = (a_list[len(a_list)/2-1] + a_list[len(a_list)/2])/2.0
  print "median: " + str(median)

  #find the mode
  def help_mode(i):
    if i in occurences:
      occurences[i] += 1
    else:
      occurences[i] = 1

  def compare_pair(x,y):
    if x[1] >= y[1]:
      return x
    else:
      return y


  map(help_mode, a_list)                    #store num occurences in dictionary
  kv_pairs = [(k,v) for (k,v) in occurences.iteritems()]
  max_pair = reduce(compare_pair, kv_pairs) #find the pair with highest freq
  mode = max_pair[0]                        #return the value with that freq
  print "mode: " + str(mode)
