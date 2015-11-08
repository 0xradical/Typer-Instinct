files = Dir['*']

groups = files.group_by {|a|  a[/(.*?)\_.*/,1]  }

groups.reject!{|a,b| a.nil? }

groups.each do |a, b|
  `mkdir #{a}`
  `mv #{b.join(' ')} #{a}`
end


groups.each do |a, b|
  b.each do |file|
    c = file[/([0-9]+)_.*\.png/,1]
    d = file[/[0-9]+_(.*)\.png/,1]

    `mv #{a}/#{file} #{a}/#{c}#{d.rjust(3, '0')}`
  end
end


groups.each do |a, _|
  files = Dir["#{a}.png/*"]

  files.each do |file|
    `mv #{file} #{file}.png`
  end

  `mv #{a}.png #{a}`
end



groups.each do |a, _|
  files = Dir["#{a}/*"]

  files.each do |file|
    `convert #{file} -filter gaussian -resize 320x240 #{file}`
  end
end






