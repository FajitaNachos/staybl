module ActiveRecord
  class Base
    def self.random(numRecords)
      records = []
      (1..numRecords).each do
        if (c = count) != 0
          area = offset(rand(c)).first
          unless records.include?(area)
            records << area
          end
        end
      end
      return records
    end
  end
end