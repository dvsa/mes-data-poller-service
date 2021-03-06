Feature: As a service owner, I want active users to be synchronised to a cache, so I can ensure that only active examiners can use the mobile app

  Scenario: Active examiner in the TARS replica, the examiner exists in the cache, examiner should be cached
    Given there is an active examiner in the TARS replica with staffNumber '123'
    And there is an examiner in the cache with staffNumber '123'
    When I invoke the user poller
    Then there should be an examiner in the cache with staffNumber '123'

  Scenario: Active examiner in the TARS replica, the examiner does not exist in the cache, examiner should be cached
    Given there is an active examiner in the TARS replica with staffNumber '123'
    And there is no examiner in the cache with staffNumber '123'
    When I invoke the user poller
    Then there should be an examiner in the cache with staffNumber '123'

  Scenario: Inactive examiner in the TARS replica, the examiner exists in the cache, examiner should not be cached
    Given there is an inactive examiner in the TARS replica with staffNumber '123'
    And there is an examiner in the cache with staffNumber '123'
    When I invoke the user poller
    Then there should not be an examiner in the cache with staffNumber '123'

  Scenario: Inactive examiner in the TARS replica, the examiner does not exist in the cache, examiner should not be cached
    Given there is an inactive examiner in the TARS replica with staffNumber '123'
    And there is no examiner in the cache with staffNumber '123'
    When I invoke the user poller
    Then there should not be an examiner in the cache with staffNumber '123'

  Scenario: No examiner in the TARS replica, the examiner does not exist in the cache, examiner should not be cached
    Given there is no examiner in the TARS replica with staffNumber '123'
    And there is no examiner in the cache with staffNumber '123'
    When I invoke the user poller
    Then there should not be an examiner in the cache with staffNumber '123'

  Scenario: No examiner in the TARS replica, the examiner exists in the cache, examiner should not be cached
    Given there is no examiner in the TARS replica with staffNumber '123'
    And there is no examiner in the cache with staffNumber '123'
    When I invoke the user poller
    Then there should not be an examiner in the cache with staffNumber '123'